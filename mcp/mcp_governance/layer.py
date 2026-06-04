"""
GovernanceLayer — the single entry point for all MCP-level protection.

Every tool call passes through this layer before any business logic runs.
The check order is cheapest-first (no I/O → fast I/O → slow I/O):

  1. Budget check       — O(1) dict lookup
  2. Concurrency check  — O(1) dict lookup, no I/O
  3. Rate limit check   — async store read/write
  4. Input validation   — CPU only, no I/O

Usage
-----
Instantiate once at server startup:

    governance = GovernanceLayer(GovernanceConfig())

Wrap each tool with the decorator:

    @mcp.tool()
    @governed(governance)
    async def my_tool(arg: str, ctx: Context) -> str:
        ...

The decorator:
  - extracts the MCP Context to get session_id
  - runs all pre-call checks (raises GovernanceViolation on failure)
  - tracks concurrency (increments before, decrements after via try/finally)
  - records the call in budget + rate limit state
  - logs every decision with structured fields
"""

import functools
import inspect
import time
from dataclasses import dataclass

import structlog

from .exceptions import (
    BudgetExceeded,
    ConcurrencyLimitExceeded,
    GovernanceViolation,
    InputValidationError,
    RateLimitExceeded,
)
from .rate_limiter import SlidingWindowRateLimiter
from .store import GovernanceStore, InMemoryStore

logger = structlog.get_logger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

@dataclass
class GovernanceConfig:
    # ── Rate limiting ───────────────────────────────────────
    rate_limit_calls:  int   = 30      # max tool calls per window
    rate_limit_window: float = 60.0   # window size in seconds

    # ── Concurrency ─────────────────────────────────────────
    max_concurrency: int = 5           # max simultaneous in-flight calls per session

    # ── Lifetime budget ─────────────────────────────────────
    session_budget: int = 500          # total calls allowed for the session's lifetime

    # ── Input validation ────────────────────────────────────
    max_string_length: int = 1000      # max length of any string argument


# ── Governance layer ──────────────────────────────────────────────────────────

class GovernanceLayer:
    def __init__(
        self,
        config: GovernanceConfig | None = None,
        store:  GovernanceStore  | None = None,
    ):
        self._cfg   = config or GovernanceConfig()
        self._store = store  or InMemoryStore()
        self._rate_limiter = SlidingWindowRateLimiter(
            store  = self._store,
            limit  = self._cfg.rate_limit_calls,
            window = self._cfg.rate_limit_window,
        )
        # session_id → current in-flight count (always in-memory — asyncio state)
        self._in_flight: dict[str, int] = {}
        self._log = logger.bind(component="governance")

    # ── Public check method ───────────────────────────────────────────────────

    async def check(
        self,
        session_id: str,
        tool_name:  str,
        args:       dict,
    ) -> None:
        """
        Run all pre-call checks for a session.
        Raises a GovernanceViolation subclass on any failure.
        Does NOT track concurrency — that's handled by the decorator.
        """
        log = self._log.bind(session_id=session_id, tool=tool_name)

        # ── 1. Budget ─────────────────────────────────────────────────────────
        used = await self._store.get_budget_used(session_id)
        if used >= self._cfg.session_budget:
            log.warning("budget_exceeded", used=used, budget=self._cfg.session_budget)
            raise BudgetExceeded(session_id, self._cfg.session_budget)

        # ── 2. Concurrency ────────────────────────────────────────────────────
        in_flight = self._in_flight.get(session_id, 0)
        if in_flight >= self._cfg.max_concurrency:
            log.warning(
                "concurrency_exceeded",
                in_flight=in_flight,
                max=self._cfg.max_concurrency,
            )
            raise ConcurrencyLimitExceeded(session_id, self._cfg.max_concurrency)

        # ── 3. Rate limit ─────────────────────────────────────────────────────
        try:
            remaining = await self._rate_limiter.check_and_record(session_id)
            log.debug("rate_limit_ok", remaining_in_window=remaining)
        except RateLimitExceeded as e:
            log.warning(
                "rate_limit_exceeded",
                retry_after_s=e.retry_after,
                limit=self._cfg.rate_limit_calls,
                window_s=self._cfg.rate_limit_window,
            )
            raise

        # ── 4. Input validation ───────────────────────────────────────────────
        _validate_inputs(args, self._cfg.max_string_length)

        # ── Record the call against the budget ────────────────────────────────
        new_total = await self._store.increment_budget(session_id)
        log.info(
            "call_allowed",
            budget_used=new_total,
            budget_total=self._cfg.session_budget,
            rate_remaining=remaining,
        )

    # ── Concurrency tracking (used by the decorator) ──────────────────────────

    def _enter_call(self, session_id: str) -> None:
        self._in_flight[session_id] = self._in_flight.get(session_id, 0) + 1

    def _exit_call(self, session_id: str) -> None:
        count = self._in_flight.get(session_id, 1) - 1
        if count <= 0:
            self._in_flight.pop(session_id, None)
        else:
            self._in_flight[session_id] = count

# ── Input validator ───────────────────────────────────────────────────────────

_ILLEGAL_PATTERNS = ["\x00", "\r\n\r\n"]   # null byte, double CRLF (injection attempt)

def _validate_inputs(args: dict, max_string_length: int) -> None:
    """
    Validate all tool arguments. Runs on every call, CPU-only, no I/O.
    Raises InputValidationError on the first violation found.
    """
    _check_dict(args, max_string_length, prefix="")


def _check_dict(obj: dict, max_len: int, prefix: str) -> None:
    for key, value in obj.items():
        field = f"{prefix}{key}" if prefix else key
        _check_value(field, value, max_len)


def _check_value(field: str, value, max_len: int) -> None:
    if isinstance(value, str):
        if len(value) > max_len:
            raise InputValidationError(
                field,
                f"exceeds max length of {max_len} (got {len(value)})"
            )
        for pattern in _ILLEGAL_PATTERNS:
            if pattern in value:
                raise InputValidationError(
                    field,
                    f"contains illegal character sequence"
                )
    elif isinstance(value, dict):
        _check_dict(value, max_len, prefix=f"{field}.")
    elif isinstance(value, list):
        for i, item in enumerate(value):
            _check_value(f"{field}[{i}]", item, max_len)


# ── Decorator ─────────────────────────────────────────────────────────────────

def governed(layer: GovernanceLayer):
    """
    Decorator that applies the governance layer to an MCP tool function.

    Usage:
        @mcp.tool()
        @governed(governance)
        async def my_tool(arg: str, ctx: Context) -> str:
            ...

    The decorated function must have a `ctx` parameter — FastMCP injects
    the MCP Context there. The decorator extracts it to get session_id.

    inspect.signature() follows __wrapped__ (set by functools.wraps) so
    FastMCP's schema generation sees the original function signature.
    """
    def decorator(fn):
        @functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            # ── Extract MCP context ───────────────────────────────────────────
            # FastMCP injects Context via the 'ctx' keyword argument.
            ctx = kwargs.get("ctx")
            if ctx is None:
                # Fallback: scan positional args (shouldn't normally happen)
                for arg in args:
                    if hasattr(arg, "client_id"):
                        ctx = arg
                        break

            session_id = getattr(ctx, "client_id", None) or "anonymous"

            # ── Collect tool arguments (everything except ctx) ────────────────sig = inspect.signature(fn)
            sig = inspect.signature(fn)
            bound = sig.bind_partial(*args, **kwargs)
            bound.apply_defaults()

            tool_args = {
                name: value
                for name, value in bound.arguments.items()
                if name != "ctx"
            }

            log = logger.bind(
                component  = "governance",
                tool       = fn.__name__,
                session_id = session_id,
            )
            start = time.monotonic()

            # ── Pre-call checks (raises GovernanceViolation on failure) ───────
            try:
                await layer.check(session_id, fn.__name__, tool_args)
            except GovernanceViolation as e:
                log.warning(
                    "tool_call_rejected",
                    reason=type(e).__name__,
                    detail=str(e),
                )
                # Re-raise as a plain string error so MCP clients see a clean message
                raise ValueError(str(e)) from e

            # ── Track concurrency across the tool's lifetime ──────────────────
            layer._enter_call(session_id)
            try:
                result = await fn(*args, **kwargs)
                log.info(
                    "tool_call_completed",
                    elapsed_ms=round((time.monotonic() - start) * 1000),
                )
                return result
            except GovernanceViolation as e:
                # Shouldn't happen inside the tool, but guard anyway
                raise ValueError(str(e)) from e
            finally:
                layer._exit_call(session_id)

        return wrapper
    return decorator