"""
OpenGIN HTTP Transport — resilience layer.

Every outbound request passes through this stack (outermost → innermost):

  1. Circuit breaker check   — fail fast if service is assumed down
  2. Semaphore               — cap concurrent in-flight requests
  3. Total timeout budget    — asyncio.wait_for across ALL retry attempts
  4. Retry loop (tenacity)   — exponential backoff + jitter, or Retry-After on 429
  5. Single HTTP attempt     — httpx with per-request timeouts
"""

import asyncio
import random
import time
from dataclasses import dataclass


import httpx
import structlog
from tenacity import (AsyncRetrying, RetryCallState, retry_if_exception_type, stop_after_attempt)

from .circuit_breaker import CircuitBreaker
from .exceptions import (
    CircuitBreakerOpenError,
    OpenGINConnectionError,
    OpenGINError,
    OpenGINRateLimitError,
    OpenGINServerError,
    OpenGINTimeoutError,
)

logger = structlog.get_logger(__name__)

# Only these exception types trigger a retry.
# 4xx errors (except 429) are the caller's fault — no point retrying.
RETRYABLE_EXCEPTIONS = (
    OpenGINTimeoutError,
    OpenGINConnectionError,
    OpenGINServerError,
    OpenGINRateLimitError,
)


def _wait_strategy(retry_state: RetryCallState) -> float:
    """
    Dynamic wait between retry attempts:
      - 429 RateLimitError  → honour the server's Retry-After value exactly
      - everything else     → exponential backoff (1 → 2 → 4 … capped at 30s)
                              plus uniform jitter in [0, 1) to avoid thundering herd
    """
    exc = retry_state.outcome.exception()
    if isinstance(exc, OpenGINRateLimitError):
        return max(exc.retry_after, 0.1)   # never wait 0 — that's a server bug

    base   = min(2 ** (retry_state.attempt_number - 1), 30)
    jitter = random.uniform(0, 1)
    return base + jitter


@dataclass
class OpenGINTransportConfig:
    max_retries: int        = 3
    total_timeout: float    = 30.0
    connect_timeout: float  = 2.0
    read_timeout: float     = 5.0
    max_concurrency: int    = 10
    cb_failure_threshold: int   = 5
    cb_recovery_timeout: float  = 30.0

class OpenGINTransport:
    def __init__(
        self,
        base_url: str,
        config: OpenGINTransportConfig,
    ):
        self._client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(
                connect=config.connect_timeout,
                read=config.read_timeout,
                write=5.0,
                pool=2.0,
            ),
            limits=httpx.Limits(
                max_connections=50,
                max_keepalive_connections=20,
            ),
        )
        self._max_retries    = config.max_retries
        self._total_timeout  = config.total_timeout
        self._semaphore      = asyncio.Semaphore(config.max_concurrency)
        self._circuit_breaker = CircuitBreaker(
            failure_threshold=config.cb_failure_threshold,
            recovery_timeout=config.cb_recovery_timeout,
        )
        self._log = logger.bind(service="opengin")

    # ------------------------------------------------------------------
    # Public API — called by OpenGINClient
    # ------------------------------------------------------------------

    async def request(
        self,
        method: str,
        url: str,
        *,
        json: dict | None = None,
        params: dict | None = None,
    ):
        log = self._log.bind(method=method, url=url)

        # ── 1. Circuit breaker — fast-fail before touching the network ──
        await self._circuit_breaker.before_call()

        # ── 2. Semaphore — limit concurrent requests ────────────────────
        async with self._semaphore:
            start = time.monotonic()

            try:
                # ── 3. Total timeout budget across all retry attempts ───
                result = await asyncio.wait_for(
                    self._request_with_retry(method, url, json=json, params=params, log=log),
                    timeout=self._total_timeout,
                )
                await self._circuit_breaker.on_success()
                log.info(
                    "request_success",
                    elapsed_ms=_ms(start),
                    circuit_state=self._circuit_breaker.state.value,
                )
                return result

            except asyncio.TimeoutError:
                await self._circuit_breaker.on_failure()
                log.error(
                    "request_total_timeout_exceeded",
                    total_timeout_s=self._total_timeout,
                    elapsed_ms=_ms(start),
                )
                raise OpenGINTimeoutError(
                    f"Total timeout of {self._total_timeout}s exceeded across all retries"
                )

            except CircuitBreakerOpenError:
                # Circuit was already open — no on_failure() call needed,
                # the breaker manages its own state.
                raise

            except Exception as e:
                await self._circuit_breaker.on_failure()
                log.error(
                    "request_failed_final",
                    error_type=type(e).__name__,
                    error=str(e),
                    elapsed_ms=_ms(start),
                    circuit_state=self._circuit_breaker.state.value,
                )
                raise

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _request_with_retry(
        self,
        method: str,
        url: str,
        *,
        json: dict | None,
        params: dict | None,
        log,
    ):
        """Retry loop — delegates wait strategy and stop condition to tenacity."""
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(self._max_retries),
            wait=_wait_strategy,
            retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
            reraise=True,                  # propagate the last exception when retries run out
        ):
            with attempt:
                attempt_number = attempt.retry_state.attempt_number
                if attempt_number > 1:
                    log.info(
                        "retry_attempt",
                        attempt=attempt_number,
                        max_retries=self._max_retries,
                    )
                return await self._do_request(method, url, json=json, params=params, log=log)

    async def _do_request(
        self,
        method: str,
        url: str,
        *,
        json: dict | None,
        params: dict | None,
        log,
    ):
        """Single HTTP attempt — maps raw httpx errors to domain exceptions."""
        start = time.monotonic()
        try:
            response = await self._client.request(method, url, json=json, params=params)

            # ── 429 Rate Limited ────────────────────────────────────────
            if response.status_code == 429:
                try:
                    retry_after = float(response.headers.get("Retry-After", 1.0))
                except ValueError:
                    retry_after = 1.0
                log.warning(
                    "rate_limited",
                    retry_after_s=retry_after,
                    url=url,
                )
                raise OpenGINRateLimitError(retry_after=retry_after)

            # ── 5xx Server Error (retryable) ────────────────────────────
            if response.status_code >= 500:
                log.warning(
                    "server_error",
                    status_code=response.status_code,
                    url=url,
                    elapsed_ms=_ms(start),
                )
                raise OpenGINServerError(f"HTTP {response.status_code}: {url}")

            # ── Other 4xx (not retryable — raise immediately) ───────────
            response.raise_for_status()

            log.debug(
                "http_ok",
                status_code=response.status_code,
                elapsed_ms=_ms(start),
            )
            return response.json()

        except (OpenGINRateLimitError, OpenGINServerError):
            raise   # already wrapped above

        except httpx.TimeoutException as e:
            log.warning("http_timeout", url=url, elapsed_ms=_ms(start), error=str(e))
            raise OpenGINTimeoutError(f"Request timed out: {e}") from e

        except httpx.ConnectError as e:
            log.warning("http_connect_error", url=url, error=str(e))
            raise OpenGINConnectionError(f"Could not connect: {e}") from e

        except httpx.HTTPStatusError as e:
            # Non-retryable 4xx
            log.warning(
                "http_client_error",
                status_code=e.response.status_code,
                url=url,
            )
            raise OpenGINError(f"HTTP {e.response.status_code}: {url}") from e

        except httpx.RequestError as e:
            raise OpenGINError(f"Unexpected HTTP error: {e}") from e

        except ValueError as e:
            raise OpenGINError(f"Invalid JSON response: {e}") from e

    async def close(self) -> None:
        await self._client.aclose()


# ------------------------------------------------------------------
# Utility
# ------------------------------------------------------------------

def _ms(start: float) -> int:
    """Elapsed milliseconds since `start` (from time.monotonic())."""
    return round((time.monotonic() - start) * 1000)