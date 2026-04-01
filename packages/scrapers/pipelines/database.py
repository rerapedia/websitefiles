"""
PostgreSQL pipeline — writes validated scraper output to database.

Two-stage process per CLAUDE.md:
1. Write to staging table (projects_raw) with raw scraped data
2. After validation, upsert to production tables (projects, builders)

Handles deduplication by rera_project_id.
"""

import json
import os
import uuid
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from itemadapter import ItemAdapter

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))


def _generate_slug(name: str, locality: str = "", city: str = "") -> str:
    """Generate SEO-friendly slug from project/builder name."""
    import re
    parts = [name]
    if locality:
        parts.append(locality)
    if city:
        parts.append(city)
    slug = "-".join(parts)
    slug = slug.lower().strip()
    slug = re.sub(r"[^\w\s\-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug[:200]  # Cap length


class PostgresPipeline:
    """Writes scraped data to PostgreSQL staging then production tables."""

    def __init__(self):
        self.conn = None
        self.state_id = None  # Haryana state UUID
        self.inserted = 0
        self.updated = 0
        self.errors = 0

    def open_spider(self, spider):
        """Connect to PostgreSQL and ensure staging table exists."""
        db_url = os.environ.get("DATABASE_URL", "")
        if not db_url:
            spider.logger.error("DATABASE_URL not set in environment")
            return

        # Strip Prisma-specific query params that psycopg2 doesn't understand
        if "?schema=" in db_url:
            db_url = db_url.split("?schema=")[0]

        try:
            self.conn = psycopg2.connect(db_url)
            self.conn.autocommit = False
            spider.logger.info("Connected to PostgreSQL")

            self._ensure_staging_table()
            self._get_haryana_state_id(spider)
        except Exception as e:
            spider.logger.error(f"Database connection failed: {e}")
            self.conn = None

    def _ensure_staging_table(self):
        """Create staging table if it doesn't exist."""
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS projects_raw (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    rera_project_id TEXT NOT NULL,
                    registration_number TEXT,
                    internal_id TEXT,
                    project_name TEXT NOT NULL,
                    project_type TEXT,
                    promoter_name TEXT,
                    project_address TEXT,
                    district TEXT,
                    tehsil TEXT,
                    registration_date TEXT,
                    registration_upto TEXT,
                    registered_with TEXT,
                    status TEXT,
                    receiving_date TEXT,
                    approval_status TEXT,
                    certificate_uploaded TEXT,
                    source_url TEXT,
                    detail_url TEXT,
                    raw_html TEXT,
                    raw_json JSONB,
                    scraped_at TIMESTAMPTZ DEFAULT NOW(),
                    processed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(rera_project_id)
                );

                CREATE INDEX IF NOT EXISTS idx_projects_raw_rera_id
                    ON projects_raw(rera_project_id);
                CREATE INDEX IF NOT EXISTS idx_projects_raw_processed
                    ON projects_raw(processed);
                CREATE INDEX IF NOT EXISTS idx_projects_raw_district
                    ON projects_raw(district);
            """)
            self.conn.commit()

    def _get_haryana_state_id(self, spider):
        """Look up the Haryana state UUID from the states table."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT id FROM states WHERE slug = 'haryana'")
            row = cur.fetchone()
            if row:
                self.state_id = row[0]
                spider.logger.info(f"Haryana state_id: {self.state_id}")
            else:
                spider.logger.warning("Haryana state not found in states table — run seed first")

    def process_item(self, item, spider):
        """Write item to staging table, then promote to production."""
        if not self.conn:
            return item

        adapter = ItemAdapter(item)
        rera_id = adapter.get("rera_project_id", "")
        if not rera_id:
            return item

        try:
            # Stage 1: Write to staging table
            self._upsert_staging(adapter)

            # Stage 2: Upsert to production tables
            self._upsert_production(adapter, spider)

            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            self.errors += 1
            spider.logger.error(
                f"DB error for {adapter.get('project_name')}: {e}"
            )

        return item

    def _upsert_staging(self, adapter: ItemAdapter):
        """Insert or update the staging table."""
        data = {k: v for k, v in adapter.items() if k != "raw_html"}

        with self.conn.cursor() as cur:
            cur.execute("""
                INSERT INTO projects_raw (
                    rera_project_id, registration_number, internal_id,
                    project_name, project_type, promoter_name,
                    project_address, district, tehsil,
                    registration_date, registration_upto, registered_with,
                    status, receiving_date, approval_status,
                    certificate_uploaded, source_url, detail_url,
                    raw_html, raw_json, scraped_at
                ) VALUES (
                    %(rera_project_id)s, %(registration_number)s, %(internal_id)s,
                    %(project_name)s, %(project_type)s, %(promoter_name)s,
                    %(project_address)s, %(district)s, %(tehsil)s,
                    %(registration_date)s, %(registration_upto)s, %(registered_with)s,
                    %(status)s, %(receiving_date)s, %(approval_status)s,
                    %(certificate_uploaded)s, %(source_url)s, %(detail_url)s,
                    %(raw_html)s, %(raw_json)s, %(scraped_at)s
                )
                ON CONFLICT (rera_project_id) DO UPDATE SET
                    registration_number = EXCLUDED.registration_number,
                    project_name = EXCLUDED.project_name,
                    project_type = EXCLUDED.project_type,
                    promoter_name = EXCLUDED.promoter_name,
                    project_address = EXCLUDED.project_address,
                    district = EXCLUDED.district,
                    status = EXCLUDED.status,
                    registration_upto = EXCLUDED.registration_upto,
                    raw_json = EXCLUDED.raw_json,
                    scraped_at = EXCLUDED.scraped_at,
                    processed = FALSE
            """, {
                **{k: adapter.get(k, "") for k in [
                    "rera_project_id", "registration_number", "internal_id",
                    "project_name", "project_type", "promoter_name",
                    "project_address", "district", "tehsil",
                    "registration_date", "registration_upto", "registered_with",
                    "status", "receiving_date", "approval_status",
                    "certificate_uploaded", "source_url", "detail_url",
                    "scraped_at",
                ]},
                "raw_html": adapter.get("raw_html", "")[:50000],
                "raw_json": json.dumps(
                    {k: v for k, v in adapter.items() if k != "raw_html"},
                    default=str,
                ),
            })

    def _upsert_production(self, adapter: ItemAdapter, spider):
        """Upsert cleaned data into production tables (builders → projects)."""
        if not self.state_id:
            return

        promoter_name = adapter.get("promoter_name", "")
        builder_id = None

        if promoter_name:
            builder_id = self._upsert_builder(promoter_name, adapter)

        self._upsert_project(adapter, builder_id, spider)

    def _upsert_builder(self, name: str, adapter: ItemAdapter) -> str:
        """Find or create builder, return UUID."""
        slug = _generate_slug(name)

        with self.conn.cursor() as cur:
            # Check if builder exists
            cur.execute("SELECT id FROM builders WHERE slug = %s", (slug,))
            row = cur.fetchone()

            if row:
                builder_id = row[0]
                # Update project count
                cur.execute("""
                    UPDATE builders SET
                        total_projects = (
                            SELECT COUNT(*) FROM projects WHERE builder_id = %s
                        ) + 1,
                        updated_at = NOW()
                    WHERE id = %s
                """, (builder_id, builder_id))
                return builder_id

            # Create new builder
            builder_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO builders (id, name, slug, total_projects, created_at, updated_at)
                VALUES (%s, %s, %s, 1, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET
                    total_projects = builders.total_projects + 1,
                    updated_at = NOW()
                RETURNING id
            """, (builder_id, name, slug))
            result = cur.fetchone()
            return result[0] if result else builder_id

    def _upsert_project(self, adapter: ItemAdapter, builder_id: str, spider):
        """Upsert project into production projects table."""
        rera_id = adapter.get("rera_project_id", "")
        project_name = adapter.get("project_name", "")
        address = adapter.get("project_address", "")
        district = adapter.get("district", "")
        city = district.title() if district else ""
        slug = _generate_slug(project_name, address[:50] if address else "", city)

        # Map status
        status = adapter.get("status", "REGISTERED")
        status_map = {
            "REGISTERED": "REGISTERED",
            "UNDER_CONSTRUCTION": "UNDER_CONSTRUCTION",
            "COMPLETED": "COMPLETED",
            "LAPSED": "LAPSED",
            "REVOKED": "REVOKED",
            "EXTENDED": "EXTENDED",
        }
        db_status = status_map.get(status, "REGISTERED")

        # Map project type
        ptype = adapter.get("project_type", "RESIDENTIAL")
        type_map = {
            "RESIDENTIAL": "RESIDENTIAL",
            "COMMERCIAL": "COMMERCIAL",
            "MIXED": "MIXED",
            "PLOTTED": "PLOTTED",
            "TOWNSHIP": "TOWNSHIP",
        }
        db_type = type_map.get(ptype, "RESIDENTIAL")

        # Parse dates
        reg_date = self._to_date(adapter.get("registration_date", ""))
        expiry_date = self._to_date(adapter.get("registration_upto", ""))

        with self.conn.cursor() as cur:
            # Check if project exists by state + rera number
            cur.execute("""
                SELECT id FROM projects
                WHERE state_id = %s AND rera_reg_number = %s
            """, (self.state_id, rera_id))
            existing = cur.fetchone()

            if existing:
                # Update existing project
                project_id = existing[0]
                cur.execute("""
                    UPDATE projects SET
                        name = %s,
                        builder_id = %s,
                        status = %s,
                        type = %s,
                        locality = %s,
                        city = %s,
                        district = %s,
                        address_full = %s,
                        rera_registration_date = %s,
                        rera_expiry_date = %s,
                        last_scraped_at = NOW(),
                        raw_data_json = %s,
                        updated_at = NOW()
                    WHERE id = %s
                """, (
                    project_name, builder_id, db_status, db_type,
                    address, city, district, address,
                    reg_date, expiry_date,
                    json.dumps({k: v for k, v in adapter.items() if k != "raw_html"}, default=str),
                    project_id,
                ))
                self.updated += 1
                spider.logger.info(f"Updated project: {project_name} ({rera_id})")
            else:
                # Insert new project
                project_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO projects (
                        id, state_id, builder_id, rera_reg_number,
                        name, slug, status, type,
                        locality, city, district, address_full,
                        rera_registration_date, rera_expiry_date,
                        last_scraped_at, raw_data_json,
                        created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s,
                        NOW(), %s,
                        NOW(), NOW()
                    )
                    ON CONFLICT (slug) DO UPDATE SET
                        status = EXCLUDED.status,
                        last_scraped_at = NOW(),
                        raw_data_json = EXCLUDED.raw_data_json,
                        updated_at = NOW()
                """, (
                    project_id, self.state_id, builder_id, rera_id,
                    project_name, slug, db_status, db_type,
                    address, city, district, address,
                    reg_date, expiry_date,
                    json.dumps({k: v for k, v in adapter.items() if k != "raw_html"}, default=str),
                ))
                self.inserted += 1
                spider.logger.info(f"Inserted project: {project_name} ({rera_id})")

            # Mark staging row as processed
            cur.execute("""
                UPDATE projects_raw SET processed = TRUE
                WHERE rera_project_id = %s
            """, (rera_id,))

    def _to_date(self, date_str: str):
        """Convert date string to date or None."""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None

    def close_spider(self, spider):
        """Close database connection and log stats."""
        if self.conn:
            spider.logger.info(
                f"Database pipeline complete: "
                f"{self.inserted} inserted, {self.updated} updated, {self.errors} errors"
            )
            self.conn.close()
