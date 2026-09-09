from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Base exception carrying an HTTP status code and machine-readable details."""

    def __init__(self, status_code: int, message: str, details: dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.details = details or {}


class NotFoundError(APIException):
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(404, message, details)


class BadRequestError(APIException):
    def __init__(self, message: str = "Bad request", details: dict = None):
        super().__init__(400, message, details)


class ServiceUnavailableError(APIException):
    def __init__(self, message: str = "Service unavailable", details: dict = None):
        super().__init__(503, message, details)


async def api_exception_handler(request: Request, exc: APIException):
    logger.error(
        f"API Error: {exc.message}",
        extra={"extra_fields": {
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code,
            "details": exc.details,
        }},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "status_code": exc.status_code,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.error(
        f"Unhandled Exception: {exc}",
        exc_info=True,
        extra={"extra_fields": {
            "path": request.url.path,
            "method": request.method,
            "request_id": request_id,
        }},
    )
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500},
    )


def register_exception_handlers(app):
    """Register all custom exception handlers on the FastAPI app."""
    from fastapi import HTTPException

    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
    return app