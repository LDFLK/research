"""
Circuit Breaker — per-transport-instance.

States:
  CLOSED    → normal operation, requests flow through
  OPEN      → service assumed unhealthy, all calls fail fast
  HALF_OPEN → cooldown elapsed, one probe request allowed through

Transitions:
  CLOSED  → OPEN       when failure_count >= failure_threshold
  OPEN    → HALF_OPEN  when recovery_timeout seconds have passed
  HALF_OPEN → CLOSED   on probe success
  HALF_OPEN → OPEN     on probe failure (reset the clock)
"""

import asyncio
import time
from enum import Enum

import structlog

from .exceptions import CircuitBreakerOpenError

logger = structlog.get_logger(__name__)


class CircuitState(Enum):
    CLOSED    = "closed"
    OPEN      = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
    ):
        """
        Args:
            failure_threshold:  consecutive failures before opening the circuit
            recovery_timeout:   seconds to wait before attempting a probe (OPEN → HALF_OPEN)
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout  = recovery_timeout

        self._state          = CircuitState.CLOSED
        self._failure_count  = 0
        self._opened_at: float | None = None
        self._lock           = asyncio.Lock()

        self._log = logger.bind(component="circuit_breaker")

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    @property
    def state(self) -> CircuitState:
        return self._state

    async def before_call(self) -> None:
        """
        Call before every outbound request.
        Raises CircuitBreakerOpenError immediately if the circuit is open
        and the recovery window hasn't elapsed yet.
        """
        async with self._lock:
            if self._state == CircuitState.OPEN:
                elapsed = time.monotonic() - self._opened_at
                if elapsed < self.recovery_timeout:
                    remaining = round(self.recovery_timeout - elapsed, 1)
                    self._log.warning(
                        "circuit_open_rejected",
                        remaining_s=remaining,
                    )
                    raise CircuitBreakerOpenError(
                        f"Circuit is open. Retry in {remaining}s"
                    )
                # Recovery window elapsed — let one probe through
                self._state = CircuitState.HALF_OPEN
                self._log.info("circuit_half_open")

    async def on_success(self) -> None:
        """Call after a successful request (all retries included)."""
        async with self._lock:
            if self._state != CircuitState.CLOSED:
                self._log.info(
                    "circuit_closed",
                    previous_state=self._state.value,
                    failure_count_reset=self._failure_count,
                )
            self._state         = CircuitState.CLOSED
            self._failure_count = 0
            self._opened_at     = None

    async def on_failure(self) -> None:
        """
        Call after a request fails (after all retries exhausted).
        Trips the circuit if the threshold is reached.
        """
        async with self._lock:
            self._failure_count += 1
            self._opened_at = time.monotonic()

            if self._failure_count >= self.failure_threshold:
                prev = self._state
                self._state = CircuitState.OPEN
                if prev != CircuitState.OPEN:
                    self._log.error(
                        "circuit_opened",
                        failure_count=self._failure_count,
                        recovery_timeout=self.recovery_timeout,
                    )
            else:
                self._log.warning(
                    "circuit_failure_recorded",
                    failure_count=self._failure_count,
                    threshold=self.failure_threshold,
                )