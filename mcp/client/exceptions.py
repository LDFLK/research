class OpenGINError(Exception):
    """Generic error for OpenGIN client operations."""
    pass


class OpenGINTimeoutError(OpenGINError):
    """Raised when a request times out (per-attempt or total budget)."""
    pass


class OpenGINConnectionError(OpenGINError):
    """Raised when a connection error occurs."""
    pass


class OpenGINServerError(OpenGINError):
    """Raised on 5xx responses — these are retryable."""
    pass


class OpenGINRateLimitError(OpenGINError):
    """
    Raised on HTTP 429. Carries the Retry-After value so the
    retry loop can wait the correct amount instead of backing off blindly.
    """
    def __init__(self, retry_after: float = 1.0):
        self.retry_after = retry_after
        super().__init__(f"Rate limited. Retry after {retry_after}s")


class CircuitBreakerOpenError(OpenGINError):
    """
    Raised immediately when the circuit is open — no request is made.
    This is a fast-fail: the downstream service is assumed to be unhealthy.
    """
    pass