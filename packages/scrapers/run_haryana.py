#!/usr/bin/env python3
"""
Runner script for Haryana RERA spider.

Usage:
    # Scrape 10 Gurgaon projects (test mode)
    python run_haryana.py --district Gurugram --max 10

    # Scrape all Gurugram projects
    python run_haryana.py --district Gurugram

    # Scrape all districts
    python run_haryana.py
"""

import argparse
import os
import sys

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def main():
    parser = argparse.ArgumentParser(description="Run Haryana RERA spider")
    parser.add_argument(
        "--district", "-d",
        help="Filter by district (e.g., Gurugram, Faridabad, Panchkula)",
        default=None,
    )
    parser.add_argument(
        "--max", "-m",
        type=int,
        help="Maximum number of projects to scrape",
        default=None,
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Skip database pipeline (output to file only)",
    )
    args = parser.parse_args()

    # Change to scrapers directory for Scrapy settings resolution
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    settings = get_project_settings()

    if args.no_db:
        # Remove database pipeline
        pipelines = dict(settings.get("ITEM_PIPELINES", {}))
        pipelines.pop("pipelines.database.PostgresPipeline", None)
        settings.set("ITEM_PIPELINES", pipelines)

    process = CrawlerProcess(settings)
    process.crawl(
        "haryana_rera",
        district=args.district,
        max_projects=args.max,
    )
    process.start()


if __name__ == "__main__":
    main()
