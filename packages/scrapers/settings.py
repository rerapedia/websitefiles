"""Scrapy settings for RERA scrapers.

Follows CLAUDE.md rules:
- Respect robots.txt
- Max 2 requests/second rate limit
- Store raw HTML in cache directory
"""

BOT_NAME = "gharscore_scrapers"

SPIDER_MODULES = ["spiders"]
NEWSPIDER_MODULE = "spiders"

# Respect robots.txt (CLAUDE.md rule)
ROBOTSTXT_OBEY = True

# Rate limiting: max 2 requests/second = 0.5s delay (CLAUDE.md rule)
DOWNLOAD_DELAY = 0.5
CONCURRENT_REQUESTS = 2
CONCURRENT_REQUESTS_PER_DOMAIN = 2

# Autothrottle for adaptive rate limiting
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 0.5
AUTOTHROTTLE_MAX_DELAY = 5
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# Identify ourselves
USER_AGENT = "GharScore Bot/1.0 (+https://gharscore.in/bot; RERA data aggregation for public transparency)"

# Retry settings
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# Timeouts
DOWNLOAD_TIMEOUT = 30

# Playwright settings for JS-heavy pages
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,
}
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = 30000

TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

# Item pipelines (order matters)
ITEM_PIPELINES = {
    "pipelines.cleaning.DataCleaningPipeline": 100,
    "pipelines.validation.ValidationPipeline": 200,
    "pipelines.database.PostgresPipeline": 300,
}

# Output
FEEDS = {
    "output/haryana_rera_%(time)s.jsonl": {
        "format": "jsonlines",
        "encoding": "utf8",
    },
}

# Logging
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s [%(name)s] %(levelname)s: %(message)s"

# Cache raw HTML for debugging (CLAUDE.md rule)
HTTPCACHE_ENABLED = True
HTTPCACHE_DIR = "cache/httpcache"
HTTPCACHE_EXPIRATION_SECS = 86400  # 24 hours
HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"
