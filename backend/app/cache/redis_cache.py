"""Caching layer (Prompt 9: Performance Optimization & Caching).

Provides a TTL cache used to memoize expensive query results. When a Redis
server is configured (``REDIS_URL``) *and* the ``redis`` package is installed
the layer uses redis.asyncio; otherwise it transparently falls back to a
thread-safe in-process store so the application always works out of the box.
"""
import asyncio
import logging
import threading
import time
from typing import Any, Callable, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

try:
    from prometheus_client import Counter

except ImportError:  # pragma: no cover - optional dependency
    Counter = None

CACHE_HITS: Optional[Any] = None
CACHE_MISSES: Optional[Any] = None
if Counter is not None:
    CACHE_HITS = Counter("mechmind_cache_hits_total", "Application cache hits")
    CACHE_MISSES = Counter("mechmind_cache_misses_total", "Application cache misses")


def _inc(metric: Optional[Any]) -> None:
    if metric is not None:
        try:
            metric.inc()
        except Exception:  # pragma: no cover - metrics must never break requests
            pass


class MemoryStore:
    """Thread-safe in-process LRU-with-TTL store (Redis-free default)."""

    def __init__(self, max_entries: int = 512) -> None:
        self._max_entries = max_entries
        self._data: Dict[str, Any] = {}
        self._expires: Dict[str, float] = {}
        self._lock = threading.RLock()

    def _sweep(self) -> None:
        now = time.monotonic()
        expired = [k for k, exp in self._expires.items() if exp <= now]
        for k in expired:
            self._data.pop(k, None)
            self._expires.pop(k, None)

    async def get(self, key: str) -> Optional[Any]:
        with self._lock:
            exp = self._expires.get(key)
            if exp is None:
                return None
            if exp <= time.monotonic():
                self._data.pop(key, None)
                self._expires.pop(key, None)
                return None
            return self._data.get(key)

    async def set(self, key: str, value: Any, ttl: int) -> None:
        with self._lock:
            if len(self._data) >= self._max_entries:
                self._sweep()
                if len(self._data) >= self._max_entries:
                    # Evict the oldest tracked key to bound memory.
                    oldest = min(self._expires.items(), key=lambda kv: kv[1]) if self._expires else None
                    if oldest:
                        self._data.pop(oldest[0], None)
                        self._expires.pop(oldest[0], None)
            self._data[key] = value
            self._expires[key] = time.monotonic() + max(ttl, 1)

    async def delete(self, key: str) -> None:
        with self._lock:
            self._data.pop(key, None)
            self._expires.pop(key, None)

    async def delete_prefix(self, prefix: str) -> int:
        with self._lock:
            keys = [k for k in list(self._data) if k.startswith(prefix)]
            for k in keys:
                self._data.pop(k, None)
                self._expires.pop(k, None)
            return len(keys)

    async def stats(self) -> Dict[str, Any]:
        with self._lock:
            return {"store": "memory", "entries": len(self._data)}


class RedisStore:
    """Async Redis backend used when REDIS_URL is configured + redis installed."""

    def __init__(self, url: str) -> None:
        self._url = url
        self._redis = None

    async def _client(self):
        if self._redis is None:
            import redis.asyncio as aioredis

            self._redis = await aioredis.from_url(self._url, decode_responses=False)
        return self._redis

    async def get(self, key: str) -> Optional[Any]:
        import pickle

        client = await self._client()
        raw = await client.get(key)
        if raw is None:
            return None
        try:
            return pickle.loads(raw)
        except Exception:
            await client.delete(key)
            return None

    async def set(self, key: str, value: Any, ttl: int) -> None:
        import pickle

        client = await self._client()
        await client.set(key, pickle.dumps(value), ex=max(ttl, 1))

    async def delete(self, key: str) -> None:
        client = await self._client()
        await client.delete(key)

    async def delete_prefix(self, prefix: str) -> int:
        client = await self._client()
        keys = [k async for k in client.scan_iter(match=f"{prefix}*", count=500)]
        if keys:
            await client.delete(*keys)
        return len(keys)

    async def stats(self) -> Dict[str, Any]:
        client = await self._client()
        dbsize = await client.dbsize()
        return {"store": "redis", "entries": dbsize}


class TTLCache:
    """Unified async TTL cache with Redis support and in-process fallback."""

    def __init__(self) -> None:
        self._backend: Any = None
        self._backend_init_lock = asyncio.Lock()
        self._used_redis = False

    def _make_backend(self):
        url = getattr(settings, "REDIS_URL", "") or ""
        if url:
            try:
                import redis  # noqa: F401

                self._used_redis = True
                return RedisStore(url)
            except ImportError:
                logger.warning("REDIS_URL is set but the 'redis' package is missing - using in-process cache")
        return MemoryStore()

    async def _backend_safe(self):
        if self._backend is None:
            async with self._backend_init_lock:
                if self._backend is None:
                    self._backend = self._make_backend()
        return self._backend

    async def get(self, key: str) -> Optional[Any]:
        backend = await self._backend_safe()
        value = await backend.get(key)
        if value is None:
            _inc(CACHE_MISSES)
        else:
            _inc(CACHE_HITS)
        return value

    async def set(self, key: str, value: Any, ttl: int = 60) -> None:
        backend = await self._backend_safe()
        await backend.set(key, value, ttl)

    async def delete(self, key: str) -> None:
        backend = await self._backend_safe()
        await backend.delete(key)
        _inc(CACHE_MISSES)  # a delete forces a recompute on next read

    async def delete_prefix(self, prefix: str) -> int:
        backend = await self._backend_safe()
        return await backend.delete_prefix(prefix)

    async def get_or_set(self, key: str, builder: Callable[[], Any], ttl: int = 60) -> Any:
        """Return the cached value for `key` or compute it with `builder` (async ok)."""
        cached = await self.get(key)
        if cached is not None:
            return cached
        result = builder()
        if asyncio.iscoroutine(result):
            result = await result
        await self.set(key, result, ttl)
        return result

    async def stats(self) -> Dict[str, Any]:
        backend = await self._backend_safe()
        stats = await backend.stats()
        stats["used_redis"] = self._used_redis
        return stats

    def invalidate_on_change(self) -> None:
        """Clear document-scoped entries (called after upload/delete)."""
        asyncio.create_task(self.delete_prefix("documents:"))


cache = TTLCache()