"""Load test for the MechMind AI API (Prompt 9).

Hammers the hot, cacheable GET endpoints and reports latency percentiles,
throughput, and cache effectiveness (first call vs. warm calls via the
X-Process-Time header).

Usage:
    python scripts/load_test.py [--url http://127.0.0.1:8000] [--users 20] [--per-user 10] [--endpoint /api/analytics/dashboard]
"""
import argparse
import asyncio
import statistics
import time

import httpx

ENDPOINTS = [
    "/api/health",
    "/api/analytics/dashboard",
    "/api/documents/",
    "/api/field/offline-pack",
    "/api/analytics/equipment-types",
]


async def hit(client: httpx.AsyncClient, path: str, out: list) -> None:
    start = time.perf_counter()
    try:
        resp = await client.get(path)
        elapsed = (time.perf_counter() - start) * 1000
        process_time = resp.headers.get("x-process-time", "")
        out.append(
            {"path": path, "status": resp.status_code, "ms": elapsed, "x-process": process_time}
        )
    except Exception as exc:  # pragma: no cover
        out.append({"path": path, "status": 0, "ms": (time.perf_counter() - start) * 1000, "x-process": str(exc)})


async def worker(base_url: str, path: str, per_user: int, results: list) -> None:
    async with httpx.AsyncClient(base_url=base_url, timeout=30.0) as client:
        # One cold call first (exercises the cache-miss path), then warm calls.
        await hit(client, path, results)
        for _ in range(per_user - 1):
            await hit(client, path, results)


async def run(base_url: str, path: str, users: int, per_user: int) -> dict:
    results: list = []
    start = time.perf_counter()
    await asyncio.gather(*(worker(base_url, path, per_user, results) for _ in range(users)))
    total = time.perf_counter() - start

    latencies = [r["ms"] for r in results if r["status"] == 200]
    errors = [r for r in results if r["status"] != 200]
    error_statuses = {}
    for err in errors:
        error_statuses[err["status"]] = error_statuses.get(err["status"], 0) + 1
    latencies.sort()

    return {
        "endpoint": path,
        "requests": len(results),
        "errors": len(errors),
        "error_statuses": error_statuses,
        "rps": len(results) / total,
        "median_ms": statistics.median(latencies) if latencies else None,
        "p90_ms": latencies[int(len(latencies) * 0.9)] if latencies else None,
        "p99_ms": latencies[int(len(latencies) * 0.99)] if latencies else None,
        "first_call_ms": results[0]["ms"] if results else None,
        "warm_calls_ms": latencies[1:min(5, len(latencies))] if latencies else [],
    }


async def main() -> None:
    parser = argparse.ArgumentParser(description="Load test the MechMind AI API")
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--users", type=int, default=8, help="Concurrent clients")
    parser.add_argument("--per-user", type=int, default=5, help="Requests per client")
    parser.add_argument("--endpoint", default=None, help="Single endpoint to test (default: all)")
    args = parser.parse_args()

    def fmt(value) -> str:
        return "n/a" if value is None else f"{value:.1f}"

    paths = [args.endpoint] if args.endpoint else ENDPOINTS
    print(f"Load testing {args.users} concurrent users x {args.per_user} requests against {args.url}\n")
    print("Note: default client count stays low so aggregate traffic stays under the 120 req/min rate limit.\n")
    for path in paths:
        report = await run(args.url, path, args.users, args.per_user)
        print(
            f"[{report['endpoint']}]\n"
            f"  requests={report['requests']} errors={report['errors']} {report['error_statuses'] or ''}"
            f" throughput={report['rps']:.1f} req/s\n"
            f"  median={fmt(report['median_ms'])}ms p90={fmt(report['p90_ms'])}ms p99={fmt(report['p99_ms'])}ms\n"
            f"  cold(first) call: {fmt(report['first_call_ms'])}ms | warm calls (first 5): "
            f"{[round(x, 1) for x in report['warm_calls_ms']] if report['warm_calls_ms'] else 'n/a'}ms\n"
        )


if __name__ == "__main__":
    asyncio.run(main())