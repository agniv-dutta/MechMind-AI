"""Security hardening middleware: response headers + in-memory rate limiting."""
from collections import defaultdict, deque
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from starlette.types import ASGIApp

from app.config import settings


EXEMPT_PREFIXES = (
    "/api/health",
    "/metrics",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/favicon.ico",
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach standard security headers to every response."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.enabled = getattr(settings, "SECURITY_HEADERS_ENABLED", True)
        self.csp = getattr(
            settings,
            "CONTENT_SECURITY_POLICY",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; connect-src 'self' ws: wss:; "
            "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
        )

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if not self.enabled:
            return response

        headers = response.headers
        headers.setdefault("X-Content-Type-Options", "nosniff")
        headers.setdefault("X-Frame-Options", "DENY")
        headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=()",
        )
        headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        headers.setdefault("X-Permitted-Cross-Domain-Policies", "none")
        headers.setdefault("Content-Security-Policy", self.csp)

        # HSTS only makes sense when the request is already over TLS.
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple sliding-window per-client rate limiter for API routes."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.enabled = getattr(settings, "RATE_LIMIT_ENABLED", True)
        self.limit = max(int(getattr(settings, "RATE_LIMIT_PER_MINUTE", 120)), 1)
        self.window = 60.0
        self._hits = defaultdict(deque)

    def _is_exempt(self, path: str) -> bool:
        if not path.startswith("/api"):
            return True
        return any(path.startswith(prefix) for prefix in EXEMPT_PREFIXES)

    def _client_key(self, request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request, call_next):
        if not self.enabled or self._is_exempt(request.url.path):
            return await call_next(request)

        client = self._client_key(request)
        now = time.monotonic()
        hits = self._hits[client]
        while hits and now - hits[0] > self.window:
            hits.popleft()

        if len(hits) >= self.limit:
            retry_after = int(self.window - (now - hits[0])) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please slow down and retry shortly.",
                    "limit_per_minute": self.limit,
                },
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)
        return await call_next(request)