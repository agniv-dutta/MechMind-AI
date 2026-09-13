"""Prometheus metrics exposition + request instrumentation (Prompt 10)."""
import time

from starlette.middleware.base import BaseHTTPMiddleware

try:
    from prometheus_client import (
        Counter,
        Histogram,
        Gauge,
        generate_latest,
        CONTENT_TYPE_LATEST,
    )

    PROMETHEUS_AVAILABLE = True
except ImportError:  # pragma: no cover - optional dependency
    PROMETHEUS_AVAILABLE = False


if PROMETHEUS_AVAILABLE:
    REQUEST_COUNT = Counter(
        "mechmind_http_requests_total",
        "Total HTTP requests",
        ["method", "path", "status"],
    )
    REQUEST_LATENCY = Histogram(
        "mechmind_http_request_duration_seconds",
        "HTTP request latency in seconds",
        ["method", "path"],
    )
    IN_PROGRESS = Gauge(
        "mechmind_http_requests_in_progress",
        "In-progress HTTP requests",
    )


def _route_template(request) -> str:
    route = request.scope.get("route")
    if route is not None and getattr(route, "path", None):
        return route.path
    return request.url.path


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Record request count/latency into Prometheus metrics."""

    async def dispatch(self, request, call_next):
        if not PROMETHEUS_AVAILABLE:
            return await call_next(request)

        path = _route_template(request)
        IN_PROGRESS.inc()
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            REQUEST_COUNT.labels(request.method, path, "500").inc()
            IN_PROGRESS.dec()
            raise
        elapsed = time.perf_counter() - start
        REQUEST_LATENCY.labels(request.method, path).observe(elapsed)
        REQUEST_COUNT.labels(request.method, path, str(response.status_code)).inc()
        IN_PROGRESS.dec()
        return response


def metrics_endpoint():
    """Return the Prometheus exposition payload (or a helpful message)."""
    if not PROMETHEUS_AVAILABLE:
        return None
    return generate_latest(), CONTENT_TYPE_LATEST