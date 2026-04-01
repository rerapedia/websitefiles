"""Scrapy item definitions for RERA project data."""

import scrapy


class HaryanaReraProjectItem(scrapy.Item):
    """Raw scraped data from Haryana RERA portal."""

    # Identifiers
    rera_project_id = scrapy.Field()       # e.g. "RERA-GRG-741-2020"
    registration_number = scrapy.Field()   # e.g. "GGM/415/147/2020/31"
    internal_id = scrapy.Field()           # Portal internal numeric ID

    # Project info
    project_name = scrapy.Field()
    project_type = scrapy.Field()          # RESIDENTIAL / COMMERCIAL / MIXED
    promoter_name = scrapy.Field()

    # Location
    project_address = scrapy.Field()
    district = scrapy.Field()
    tehsil = scrapy.Field()

    # Registration
    registration_date = scrapy.Field()
    registration_upto = scrapy.Field()     # Expiry date
    registered_with = scrapy.Field()       # "HRERA" or "Interim RERA"
    status = scrapy.Field()                # Current status text

    # Additional detail page fields
    receiving_date = scrapy.Field()
    approval_status = scrapy.Field()
    certificate_uploaded = scrapy.Field()

    # Metadata
    source_url = scrapy.Field()
    detail_url = scrapy.Field()
    scraped_at = scrapy.Field()
    raw_html = scrapy.Field()              # For debugging/audit
