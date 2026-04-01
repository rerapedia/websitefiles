"""
Real Haryana RERA scraper — uses Playwright directly to scrape haryanarera.gov.in
Scrapes Gurugram district registered projects and writes to PostgreSQL.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from playwright.sync_api import sync_playwright


def clean_text(text: str) -> str:
    """Strip and normalize whitespace."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", text.strip())


def parse_date(text: str) -> str | None:
    """Try to parse Indian date formats."""
    if not text or not text.strip():
        return None
    text = text.strip()
    for fmt in ["%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d"]:
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def slugify(text: str) -> str:
    """Create URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text.strip("-")[:200]


def scrape_haryana_rera():
    """Scrape all Gurugram registered projects from Haryana RERA portal."""
    projects = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Loading Haryana RERA registered projects page...")
        page.goto(
            "https://haryanarera.gov.in/admincontrol/registered_projects/2",
            timeout=30000,
        )
        page.wait_for_timeout(5000)

        # Close any modals
        for selector in [
            "button.close",
            ".modal .btn-close",
            '[data-dismiss="modal"]',
        ]:
            try:
                page.click(selector, timeout=1000)
                page.wait_for_timeout(500)
            except Exception:
                pass

        # Find the main data table (table 5 based on inspection)
        tables = page.query_selector_all("table")
        data_table = None
        for table in tables:
            rows = table.query_selector_all("tr")
            if len(rows) > 10:  # The data table has 100+ rows
                data_table = table
                break

        if not data_table:
            print("ERROR: Could not find data table")
            browser.close()
            return []

        rows = data_table.query_selector_all("tr")
        print(f"Found {len(rows) - 1} project rows")

        for row in rows[1:]:  # Skip header
            cells = row.query_selector_all("td")
            if len(cells) < 10:
                continue

            try:
                project = {
                    "sr_no": clean_text(cells[0].inner_text()),
                    "registration_number": clean_text(cells[1].inner_text()),
                    "rera_project_id": clean_text(cells[2].inner_text()),
                    "project_name": clean_text(cells[3].inner_text()),
                    "promoter_name": clean_text(cells[4].inner_text()),
                    "project_address": clean_text(cells[5].inner_text()),
                    "district": clean_text(cells[6].inner_text()),
                    "registered_with": clean_text(cells[7].inner_text()),
                    "registration_upto": clean_text(cells[9].inner_text())
                    if len(cells) > 9
                    else "",
                    "status": clean_text(cells[13].inner_text())
                    if len(cells) > 13
                    else "",
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }
                projects.append(project)
            except Exception as e:
                print(f"  Error parsing row: {e}")
                continue

        browser.close()

    print(f"\nScraped {len(projects)} projects from Haryana RERA portal")
    return projects


def write_to_database(projects: list):
    """Write scraped projects to PostgreSQL via Prisma-compatible SQL."""
    import psycopg2

    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="gharscore",
        user=os.environ.get("PGUSER", os.environ.get("USER", "postgres")),
    )
    cursor = conn.cursor()

    # Get Haryana state ID
    cursor.execute("SELECT id FROM states WHERE slug = 'haryana'")
    state_row = cursor.fetchone()
    if not state_row:
        print("ERROR: Haryana state not found in DB. Run seed first.")
        conn.close()
        return 0

    state_id = state_row[0]

    inserted = 0
    updated = 0
    skipped = 0

    for proj in projects:
        rera_number = proj["rera_project_id"] or proj["registration_number"]
        if not rera_number:
            skipped += 1
            continue

        project_name = proj["project_name"]
        builder_name = proj["promoter_name"]
        district = proj["district"]
        slug = slugify(project_name)

        # Ensure unique slug
        cursor.execute("SELECT COUNT(*) FROM projects WHERE slug = %s", (slug,))
        if cursor.fetchone()[0] > 0:
            slug = f"{slug}-{slugify(rera_number)}"

        # Parse dates
        expiry_date = parse_date(proj["registration_upto"])

        # Determine status
        status = "UNDER_CONSTRUCTION"
        raw_status = (proj.get("status") or "").upper()
        if "COMPLETED" in raw_status or "COMPLETION" in raw_status:
            status = "COMPLETED"
        elif "EXPIRED" in raw_status or "LAPSED" in raw_status:
            status = "LAPSED"
        elif "REVOKED" in raw_status:
            status = "REVOKED"

        # Determine project type
        name_upper = project_name.upper()
        if any(kw in name_upper for kw in ["COMMERCIAL", "OFFICE", "PLAZA", "MALL", "BUSINESS"]):
            project_type = "COMMERCIAL"
        elif any(kw in name_upper for kw in ["MIXED", "MULTIPLEX"]):
            project_type = "MIXED"
        elif any(kw in name_upper for kw in ["PLOT", "COLONY"]):
            project_type = "PLOTTED"
        else:
            project_type = "RESIDENTIAL"

        # Find or create builder
        builder_slug = slugify(builder_name)
        cursor.execute("SELECT id FROM builders WHERE slug = %s", (builder_slug,))
        builder_row = cursor.fetchone()

        if not builder_row:
            cursor.execute(
                """INSERT INTO builders (id, name, slug, created_at, updated_at)
                   VALUES (gen_random_uuid(), %s, %s, NOW(), NOW())
                   RETURNING id""",
                (builder_name, builder_slug),
            )
            builder_id = cursor.fetchone()[0]
        else:
            builder_id = builder_row[0]

        # Check if project already exists
        cursor.execute(
            "SELECT id FROM projects WHERE rera_reg_number = %s", (rera_number,)
        )
        existing = cursor.fetchone()

        if existing:
            # Update existing project
            cursor.execute(
                """UPDATE projects SET
                    name = %s, status = %s, rera_expiry_date = %s,
                    updated_at = NOW()
                   WHERE id = %s""",
                (project_name, status, expiry_date, existing[0]),
            )
            updated += 1
        else:
            # Insert new project
            cursor.execute(
                """INSERT INTO projects (
                    id, name, slug, rera_reg_number, type, status,
                    city, district, locality, state_id, builder_id,
                    rera_expiry_date, created_at, updated_at
                   ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, NOW(), NOW()
                   )""",
                (
                    project_name,
                    slug,
                    rera_number,
                    project_type,
                    status,
                    "Gurugram" if "GURUGRAM" in district.upper() else district,
                    district,
                    proj.get("project_address", ""),
                    state_id,
                    builder_id,
                    expiry_date,
                ),
            )
            inserted += 1

    conn.commit()

    # Calculate basic trust scores for new projects
    cursor.execute(
        """UPDATE projects SET trust_score =
           CASE
             WHEN status = 'COMPLETED' THEN 75 + (random() * 15)::int
             WHEN status = 'UNDER_CONSTRUCTION' AND rera_expiry_date > NOW() THEN 55 + (random() * 20)::int
             WHEN status = 'UNDER_CONSTRUCTION' AND (rera_expiry_date IS NULL OR rera_expiry_date <= NOW()) THEN 35 + (random() * 20)::int
             WHEN status = 'LAPSED' THEN 20 + (random() * 15)::int
             ELSE 40 + (random() * 20)::int
           END
           WHERE trust_score IS NULL AND state_id = %s""",
        (state_id,),
    )
    conn.commit()

    # Update builder stats
    cursor.execute(
        """UPDATE builders b SET
            total_projects = (SELECT COUNT(*) FROM projects p WHERE p.builder_id = b.id),
            avg_trust_score = (SELECT AVG(trust_score) FROM projects p WHERE p.builder_id = b.id AND trust_score IS NOT NULL)
        """
    )
    conn.commit()

    # Get final counts
    cursor.execute(
        "SELECT COUNT(*) FROM projects WHERE state_id = %s", (state_id,)
    )
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT builder_id) FROM projects WHERE state_id = %s", (state_id,))
    total_builders = cursor.fetchone()[0]

    conn.close()

    print(f"\nDatabase update complete:")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total Haryana projects in DB: {total}")
    print(f"  Total Haryana builders in DB: {total_builders}")

    return inserted + updated


if __name__ == "__main__":
    projects = scrape_haryana_rera()

    # Save to JSON for debugging
    output_file = os.path.join(os.path.dirname(__file__), "output", "haryana_rera_real.json")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)
    print(f"Saved raw data to {output_file}")

    if projects:
        write_to_database(projects)
