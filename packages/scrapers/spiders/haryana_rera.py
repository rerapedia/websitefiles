"""
Haryana RERA Spider — scrapes project data from haryanarera.gov.in

Data sources:
- Registered projects list: /admincontrol/registered_projects/2 (Gurugram)
- Project detail pages: /view_project/searchprojectDetail/{id}
- Public search: /assistancecontrol/project_search_public/2

Respects robots.txt, rate limited to 2 req/s per CLAUDE.md rules.
"""

import re
from datetime import datetime, timezone

import scrapy
from scrapy.http import HtmlResponse
from scrapy_playwright.page import PageMethod

from items import HaryanaReraProjectItem


class HaryanaReraSpider(scrapy.Spider):
    name = "haryana_rera"
    allowed_domains = ["haryanarera.gov.in"]

    # Configuration
    custom_settings = {
        "DOWNLOAD_DELAY": 0.5,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
    }

    # Which districts to scrape (can be overridden via -a district=Gurgaon)
    DISTRICT_FILTER = None
    MAX_PROJECTS = None  # Set via -a max_projects=10 for testing

    def __init__(self, district=None, max_projects=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if district:
            self.DISTRICT_FILTER = district.upper()
        if max_projects:
            self.MAX_PROJECTS = int(max_projects)
        self._project_count = 0

    def start_requests(self):
        """Start by loading the registered projects list for Gurugram."""
        yield scrapy.Request(
            url="https://haryanarera.gov.in/admincontrol/registered_projects/2",
            callback=self.parse_project_list,
            meta={
                "playwright": True,
                "playwright_page_methods": [
                    PageMethod("wait_for_selector", "table", timeout=15000),
                    PageMethod("wait_for_timeout", 3000),
                ],
            },
            errback=self.handle_error,
        )

    def parse_project_list(self, response: HtmlResponse):
        """Parse the registered projects table and extract project rows."""
        self.logger.info("Parsing registered projects list page")

        # The table contains all registered projects
        rows = response.css("table tbody tr")
        if not rows:
            # Try alternate table selectors
            rows = response.xpath("//table//tr[td]")

        self.logger.info(f"Found {len(rows)} project rows in table")

        for row in rows:
            if self.MAX_PROJECTS and self._project_count >= self.MAX_PROJECTS:
                self.logger.info(f"Reached max_projects limit ({self.MAX_PROJECTS})")
                return

            cells = row.css("td")
            if len(cells) < 6:
                continue

            # Extract data from list table columns:
            # 0: Sr.No, 1: Reg Certificate No, 2: Project ID, 3: Project Name,
            # 4: Builder, 5: Location, 6: District, 7: Registered With,
            # 8: Details Form, 9: Registration Upto, 10: Certificate, 11: Status
            project_data = {
                "registration_number": self._clean_text(cells[1]),
                "rera_project_id": self._clean_text(cells[2]),
                "project_name": self._clean_text(cells[3]),
                "promoter_name": self._clean_text(cells[4]),
                "project_address": self._clean_text(cells[5]),
                "district": self._clean_text(cells[6]) if len(cells) > 6 else "",
                "registered_with": self._clean_text(cells[7]) if len(cells) > 7 else "",
                "registration_upto": self._clean_text(cells[9]) if len(cells) > 9 else "",
                "status": self._clean_text(cells[11]) if len(cells) > 11 else "",
            }

            # Apply district filter
            if self.DISTRICT_FILTER:
                district = project_data.get("district", "").upper()
                if self.DISTRICT_FILTER not in district:
                    continue

            # Extract internal ID from detail link
            detail_link = row.css("a[href*='searchprojectDetail']::attr(href)").get()
            if not detail_link:
                # Try other link patterns
                detail_link = row.css("a::attr(href)").re_first(r".*/(\d+)")

            internal_id = None
            if detail_link:
                id_match = re.search(r"/(\d+)$", detail_link)
                if id_match:
                    internal_id = id_match.group(1)

            project_data["internal_id"] = internal_id

            if internal_id:
                detail_url = f"https://haryanarera.gov.in/view_project/searchprojectDetail/{internal_id}"
                self._project_count += 1
                yield scrapy.Request(
                    url=detail_url,
                    callback=self.parse_project_detail,
                    meta={
                        "project_data": project_data,
                        "playwright": True,
                        "playwright_page_methods": [
                            PageMethod("wait_for_selector", "body", timeout=10000),
                            PageMethod("wait_for_timeout", 1000),
                        ],
                    },
                    errback=self.handle_error,
                )
            else:
                # No detail link — yield what we have from the list
                self._project_count += 1
                yield self._build_item(project_data, response.url)

    def parse_project_detail(self, response: HtmlResponse):
        """Parse individual project detail page for additional info."""
        project_data = response.meta["project_data"]

        self.logger.info(
            f"Parsing detail for: {project_data.get('project_name', 'Unknown')}"
        )

        # Extract additional fields from the detail page
        # These pages typically have label-value pairs in tables or divs
        page_text = response.text

        # Try to extract fields by looking for label patterns
        detail_fields = self._extract_detail_fields(response)
        project_data.update(detail_fields)

        # Set detail URL
        project_data["detail_url"] = response.url

        # Store raw HTML for debugging (CLAUDE.md rule)
        project_data["raw_html"] = page_text[:50000]  # Cap at 50KB

        yield self._build_item(project_data, response.url)

    def _extract_detail_fields(self, response: HtmlResponse) -> dict:
        """Extract structured fields from the detail page HTML."""
        fields = {}

        # Common patterns on RERA detail pages: label in <th>/<td>/<strong> followed by value
        # Try multiple extraction strategies

        # Strategy 1: Look for table rows with label-value pairs
        for row in response.css("table tr"):
            cells = row.css("td")
            if len(cells) >= 2:
                label = self._clean_text(cells[0]).lower()
                value = self._clean_text(cells[1])

                if not label or not value:
                    continue

                if "project name" in label:
                    fields["project_name"] = value
                elif "promoter" in label or "builder" in label:
                    fields["promoter_name"] = value
                elif "district" in label:
                    fields["district"] = value
                elif "tehsil" in label:
                    fields["tehsil"] = value
                elif "location" in label or "address" in label:
                    fields["project_address"] = value
                elif "registration number" in label or "reg" in label and "no" in label:
                    fields["registration_number"] = value
                elif "project id" in label or "rera" in label and "id" in label:
                    fields["rera_project_id"] = value
                elif "receiving date" in label:
                    fields["receiving_date"] = value
                elif "status" in label and "approval" in label:
                    fields["approval_status"] = value
                elif "status" in label:
                    fields["status"] = value
                elif "certificate" in label and "upload" in label:
                    fields["certificate_uploaded"] = value
                elif "type" in label and "project" in label:
                    fields["project_type"] = value

        # Strategy 2: Look for div/span with class patterns
        for elem in response.css(".form-group, .detail-row, .info-row"):
            label_el = elem.css("label, .label, strong, th")
            value_el = elem.css("input::attr(value), .value, td:last-child, span:last-child")
            if label_el and value_el:
                label = self._clean_text(label_el[0]).lower()
                value = value_el[0].css("::text").get("").strip()
                if value and "project type" in label:
                    fields["project_type"] = value

        return fields

    def _build_item(self, data: dict, source_url: str) -> HaryanaReraProjectItem:
        """Build a scrapy Item from extracted data."""
        item = HaryanaReraProjectItem()
        item["rera_project_id"] = data.get("rera_project_id", "")
        item["registration_number"] = data.get("registration_number", "")
        item["internal_id"] = data.get("internal_id", "")
        item["project_name"] = data.get("project_name", "")
        item["project_type"] = self._classify_project_type(data)
        item["promoter_name"] = data.get("promoter_name", "")
        item["project_address"] = data.get("project_address", "")
        item["district"] = data.get("district", "")
        item["tehsil"] = data.get("tehsil", "")
        item["registration_date"] = data.get("registration_date", "")
        item["registration_upto"] = data.get("registration_upto", "")
        item["registered_with"] = data.get("registered_with", "")
        item["status"] = data.get("status", "")
        item["receiving_date"] = data.get("receiving_date", "")
        item["approval_status"] = data.get("approval_status", "")
        item["certificate_uploaded"] = data.get("certificate_uploaded", "")
        item["source_url"] = source_url
        item["detail_url"] = data.get("detail_url", "")
        item["scraped_at"] = datetime.now(timezone.utc).isoformat()
        item["raw_html"] = data.get("raw_html", "")
        return item

    def _classify_project_type(self, data: dict) -> str:
        """Infer project type from available data."""
        explicit_type = data.get("project_type", "").upper()
        if "COMMERCIAL" in explicit_type:
            return "COMMERCIAL"
        if "MIXED" in explicit_type:
            return "MIXED"
        if "PLOTTED" in explicit_type:
            return "PLOTTED"
        if "RESIDENTIAL" in explicit_type:
            return "RESIDENTIAL"

        # Try to infer from project name
        name = data.get("project_name", "").upper()
        if any(kw in name for kw in ["MALL", "OFFICE", "COMMERCIAL", "PLAZA", "BUSINESS", "IT PARK"]):
            return "COMMERCIAL"
        if any(kw in name for kw in ["TOWNSHIP", "CITY", "TOWN"]):
            return "TOWNSHIP"

        return "RESIDENTIAL"  # Default assumption

    def _clean_text(self, selector_or_element) -> str:
        """Extract and clean text from a selector or element."""
        if hasattr(selector_or_element, "css"):
            text = selector_or_element.css("::text").getall()
            return " ".join(t.strip() for t in text if t.strip())
        if isinstance(selector_or_element, str):
            return selector_or_element.strip()
        return ""

    def handle_error(self, failure):
        """Log request failures."""
        self.logger.error(f"Request failed: {failure.request.url} — {failure.value}")
