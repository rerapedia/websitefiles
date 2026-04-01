"""
Data cleaning pipeline for RERA scraper output.

Handles:
- Builder/promoter name normalization
- Date parsing
- District/location standardization
- Status normalization
"""

import re
from datetime import datetime

from itemadapter import ItemAdapter


class DataCleaningPipeline:
    """Cleans and normalizes raw scraped RERA data."""

    # Common suffixes to normalize in builder names
    BUILDER_SUFFIXES = {
        r"\bPVT\.?\s*LTD\.?": "PRIVATE LIMITED",
        r"\bPRIVATE\s+LTD\.?": "PRIVATE LIMITED",
        r"\bLTD\.?\b": "LIMITED",
        r"\bLLP\b": "LLP",
        r"\bINC\.?\b": "INC",
    }

    # District name normalization
    DISTRICT_MAP = {
        "GURUGRAM": "GURUGRAM",
        "GURGAON": "GURUGRAM",
        "GGM": "GURUGRAM",
        "FARIDABAD": "FARIDABAD",
        "FBD": "FARIDABAD",
        "PANCHKULA": "PANCHKULA",
        "PKL": "PANCHKULA",
        "SONIPAT": "SONIPAT",
        "PANIPAT": "PANIPAT",
        "KARNAL": "KARNAL",
        "AMBALA": "AMBALA",
        "HISAR": "HISAR",
        "ROHTAK": "ROHTAK",
        "REWARI": "REWARI",
        "JHAJJAR": "JHAJJAR",
        "PALWAL": "PALWAL",
        "NUH": "NUH",
        "MAHENDRAGARH": "MAHENDRAGARH",
    }

    # Project status normalization
    STATUS_MAP = {
        "APPROVED AND CERTIFICATE UPLOADED": "REGISTERED",
        "APPROVED": "REGISTERED",
        "RC APPROVED": "REGISTERED",
        "REGISTERED": "REGISTERED",
        "LAPSED": "LAPSED",
        "LAPSED PROJECT": "LAPSED",
        "CANCELLED": "REVOKED",
        "REVOKED": "REVOKED",
        "UNDER CONSTRUCTION": "UNDER_CONSTRUCTION",
        "COMPLETED": "COMPLETED",
        "EXTENDED": "EXTENDED",
    }

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)

        # Clean project name
        name = adapter.get("project_name", "")
        adapter["project_name"] = self._clean_name(name)

        # Normalize builder/promoter name
        promoter = adapter.get("promoter_name", "")
        adapter["promoter_name"] = self._normalize_builder_name(promoter)

        # Normalize district
        district = adapter.get("district", "")
        adapter["district"] = self._normalize_district(district)

        # Parse dates
        for date_field in ["registration_date", "registration_upto", "receiving_date"]:
            raw_date = adapter.get(date_field, "")
            adapter[date_field] = self._parse_date(raw_date) if raw_date else ""

        # Normalize status
        status = adapter.get("status", "")
        adapter["status"] = self._normalize_status(status)

        # Clean RERA project ID
        rera_id = adapter.get("rera_project_id", "")
        adapter["rera_project_id"] = rera_id.strip().upper()

        # Clean address
        address = adapter.get("project_address", "")
        adapter["project_address"] = self._clean_address(address)

        # Infer tehsil from district if missing
        if not adapter.get("tehsil") and adapter.get("district"):
            adapter["tehsil"] = adapter["district"].title()

        # Strip raw_html from the item going forward in pipeline
        # (it's already saved to cache via HTTPCACHE)
        # Keep it for database storage but don't pass to validation
        adapter["raw_html"] = adapter.get("raw_html", "")[:50000]

        spider.logger.debug(f"Cleaned: {adapter.get('project_name')} ({adapter.get('rera_project_id')})")

        return item

    def _clean_name(self, name: str) -> str:
        """Clean project/entity names."""
        name = name.strip()
        # Remove excessive whitespace
        name = re.sub(r"\s+", " ", name)
        # Title case
        name = name.title()
        # Fix common title case issues
        name = name.replace("'S", "'s").replace("Llp", "LLP")
        return name

    def _normalize_builder_name(self, name: str) -> str:
        """Normalize builder/promoter company names for deduplication."""
        if not name:
            return ""
        name = name.strip()
        name = re.sub(r"\s+", " ", name)
        upper_name = name.upper()

        # Normalize legal suffixes
        for pattern, replacement in self.BUILDER_SUFFIXES.items():
            upper_name = re.sub(pattern, replacement, upper_name)

        # Remove special chars except & and -
        upper_name = re.sub(r"[^\w\s&\-]", "", upper_name)
        upper_name = re.sub(r"\s+", " ", upper_name).strip()

        # Convert back to title case but keep suffixes uppercase
        parts = upper_name.split()
        result = []
        keep_upper = {"PRIVATE", "LIMITED", "LTD", "LLP", "INC", "AND", "PVT"}
        for part in parts:
            if part in keep_upper:
                result.append(part)
            else:
                result.append(part.title())
        return " ".join(result)

    def _normalize_district(self, district: str) -> str:
        """Normalize district name to standard form."""
        if not district:
            return ""
        clean = district.strip().upper()
        clean = re.sub(r"\s+", " ", clean)
        return self.DISTRICT_MAP.get(clean, clean)

    def _normalize_status(self, status: str) -> str:
        """Map portal status text to our enum values."""
        if not status:
            return "REGISTERED"
        clean = status.strip().upper()
        # Check for known patterns
        for pattern, normalized in self.STATUS_MAP.items():
            if pattern in clean:
                return normalized
        return "REGISTERED"  # Default

    def _parse_date(self, date_str: str) -> str:
        """Parse various date formats to ISO format."""
        if not date_str:
            return ""
        date_str = date_str.strip()

        # Try common formats
        formats = [
            "%d-%b-%Y",      # 14-Sep-2020
            "%d-%m-%Y",      # 14-09-2020
            "%d/%m/%Y",      # 14/09/2020
            "%Y-%m-%d",      # 2020-09-14
            "%d %b %Y",      # 14 Sep 2020
            "%d %B %Y",      # 14 September 2020
            "%d.%m.%Y",      # 14.09.2020
        ]

        for fmt in formats:
            try:
                parsed = datetime.strptime(date_str, fmt)
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                continue

        # Try to extract date from longer strings like "GGM/415/147/2020/31 DATED 09.10.2020"
        date_match = re.search(r"(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})", date_str)
        if date_match:
            day, month, year = date_match.groups()
            try:
                parsed = datetime(int(year), int(month), int(day))
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                pass

        return date_str  # Return original if unparseable

    def _clean_address(self, address: str) -> str:
        """Clean and standardize project address."""
        if not address:
            return ""
        address = address.strip()
        address = re.sub(r"\s+", " ", address)
        # Standardize sector naming
        address = re.sub(r"(?i)sec\.?\s*", "Sector ", address)
        address = re.sub(r"(?i)sect\.?\s*", "Sector ", address)
        return address
