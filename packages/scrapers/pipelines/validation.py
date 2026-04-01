"""
Validation pipeline — validates scraped items using Pydantic models.

Mirrors the Zod validation schema on the TypeScript side.
Items that fail validation are logged and dropped.
"""

import re
from datetime import datetime
from typing import Optional

from itemadapter import ItemAdapter
from pydantic import BaseModel, field_validator, model_validator
from scrapy.exceptions import DropItem


class HaryanaReraProjectSchema(BaseModel):
    """Validation schema for Haryana RERA project data.

    Mirrors the Zod schema in packages/shared/schemas/scraper-output.ts
    """

    rera_project_id: str
    registration_number: str
    project_name: str
    promoter_name: str
    project_type: str
    project_address: str
    district: str
    status: str

    # Optional fields
    internal_id: Optional[str] = None
    tehsil: Optional[str] = None
    registration_date: Optional[str] = None
    registration_upto: Optional[str] = None
    registered_with: Optional[str] = None
    receiving_date: Optional[str] = None
    approval_status: Optional[str] = None
    certificate_uploaded: Optional[str] = None
    source_url: Optional[str] = None
    detail_url: Optional[str] = None
    scraped_at: Optional[str] = None

    @field_validator("rera_project_id")
    @classmethod
    def validate_rera_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("rera_project_id cannot be empty")
        if not re.match(r"^RERA-[A-Z]{2,4}-\d+-\d{4}$", v):
            # Relaxed pattern — some IDs may differ
            if len(v) < 5:
                raise ValueError(f"rera_project_id too short: {v}")
        return v

    @field_validator("project_name")
    @classmethod
    def validate_project_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("project_name must be at least 2 characters")
        if len(v) > 500:
            raise ValueError("project_name exceeds 500 characters")
        return v

    @field_validator("promoter_name")
    @classmethod
    def validate_promoter_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("promoter_name must be at least 2 characters")
        return v

    @field_validator("project_type")
    @classmethod
    def validate_project_type(cls, v: str) -> str:
        allowed = {"RESIDENTIAL", "COMMERCIAL", "MIXED", "PLOTTED", "TOWNSHIP"}
        if v not in allowed:
            raise ValueError(f"Invalid project_type: {v}. Must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {
            "REGISTERED", "UNDER_CONSTRUCTION", "COMPLETED",
            "LAPSED", "REVOKED", "EXTENDED",
        }
        if v not in allowed:
            raise ValueError(f"Invalid status: {v}. Must be one of {allowed}")
        return v

    @field_validator("district")
    @classmethod
    def validate_district(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("district cannot be empty")
        return v

    @field_validator("registration_date", "registration_upto", "receiving_date")
    @classmethod
    def validate_date(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        # Accept ISO dates or empty strings
        if v == "":
            return None
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            # Not a fatal error — log but keep
            pass
        return v

    @model_validator(mode="after")
    def check_required_combo(self):
        """Ensure we have enough data to identify the project."""
        if not self.rera_project_id and not self.registration_number:
            raise ValueError("Need at least rera_project_id or registration_number")
        return self


class ValidationPipeline:
    """Validates items against the Pydantic schema. Drops invalid items."""

    def __init__(self):
        self.valid_count = 0
        self.dropped_count = 0

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)

        # Extract fields for validation (exclude raw_html)
        data = {k: v for k, v in adapter.items() if k != "raw_html"}

        try:
            validated = HaryanaReraProjectSchema(**data)
            spider.logger.debug(
                f"Validated: {validated.project_name} ({validated.rera_project_id})"
            )
            self.valid_count += 1
            return item
        except Exception as e:
            self.dropped_count += 1
            spider.logger.warning(
                f"Validation failed for {data.get('project_name', '?')} "
                f"({data.get('rera_project_id', '?')}): {e}"
            )
            raise DropItem(f"Validation failed: {e}")

    def close_spider(self, spider):
        spider.logger.info(
            f"Validation complete: {self.valid_count} valid, {self.dropped_count} dropped"
        )
