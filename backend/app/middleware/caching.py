"""HTTP caching headers middleware (Prompt 9)."""
import re
import time
from typing import Dict, Pattern, Tuple

from starlette.middleware.base import BaseHTTPMiddleware

# path pattern -> (cache-control directive, ttl seconds)
CACHE_RULES: Dict[Pattern, Tuple[str, int]] = {
    re.compile(r"^/api/documents.*/pages/.*"): ("public, max-age", 300),
    re.compile(r"^/api/documents/$"): ("public, max-age", 10),
    re.compile(r"^/api/documents$"): ("public, max-age", 10),
    re.compile(r"^/api/documents/.*"): ("public, max-age", 120),
    re.compile(r"^/api/analytics/"): ("public, max-age", 10),
    re.compile(r"^/api/field/offline-pack"): ("public, max-age", 60),
    re.compile(r"^/api/health"): ("public, max-age", 30),
    re.compile(r"^/api/diagrams/analyses"): ("public, max-age", 30),
    re.compile(r"^/api/diagrams/search"): ("public, max-age", 30),
    re.compile(r"^/api/equipment"): ("public, max-age", 15),
}

# These endpoints return dynamic / streaming / auth-bound data and must not be cached.
NO_STORE_PATTERNS: Pattern = re.compile(
    r"^/(metrics|docs|redoc|openapi.json)|^/api/(chat|ai|telemetry|reports)/"
)


def _rule_for(path: str):
    for pattern, rule in CACHE_RULES.items():
        if pattern.search(path):
            return rule
    return None


class CacheControlMiddleware(BaseHTTPMiddleware):
    """Attach Cache-Control + Last-Modified headers to cacheable GET responses."""

    async def dispatch(self, request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Process-Time"] = f"{elapsed_ms}ms"

        if request.method != "GET" or response.status_code >= 400:
            response.headers["Cache-Control"] = "no-store"
            return response

        if NO_STORE_PATTERNS.search(request.url.path):
            response.headers["Cache-Control"] = "no-store"
            return response

        rule = _rule_for(request.url.path)
        if rule:
            directive, ttl = rule
            response.headers["Cache-Control"] = f"{directive}={ttl}"
            response.headers["Last-Modified"] = time.strftime(
                "%a, %d %b %Y %H:%M:%S GMT", time.gmtime()
            )
        else:
            # Default: private, revalidate (correct for most dynamic content).
            response.headers["Cache-Control"] = "no-cache"

        return response