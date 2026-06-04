"""
State storage for the governance layer.

InMemoryStore — single-process, lost on restart.
               Right for stdio / single-instance deployments.

When you move to a multi-instance HTTP deployment, implement RedisStore
with the same interface and swap it in GovernanceLayer — nothing else changes.
"""

import asyncio
import time
from abc import ABC, abstractmethod


# ── Abstract interface ────────────────────────────────────────────────────────

class GovernanceStore(ABC):
    """
    Minimal interface the governance layer needs from storage.
    Concurrency counts are NOT here — they're asyncio state (in-process only).
    """

    @abstractmethod
    async def get_call_timestamps(self, session_id: str) -> list[float]:
        """Return all recorded call timestamps for the session (monotonic seconds)."""
        ...

    @abstractmethod
    async def set_call_timestamps(self, session_id: str, timestamps: list[float]) -> None:
        """Overwrite the timestamp list for the session."""
        ...

    @abstractmethod
    async def get_budget_used(self, session_id: str) -> int:
        """Return how many lifetime calls this session has made."""
        ...

    @abstractmethod
    async def increment_budget(self, session_id: str) -> int:
        """Increment the lifetime counter and return the new value."""
        ...


# ── In-memory implementation ──────────────────────────────────────────────────

class InMemoryStore(GovernanceStore):
    """
    All state lives in plain Python dicts inside this process.

    Thread-safety: asyncio is single-threaded; dict operations between
    awaits are atomic in CPython, so no explicit locking is needed here.
    """

    def __init__(self):
        # session_id → list of monotonic timestamps (one per call)
        self._timestamps: dict[str, list[float]] = {}

        # session_id → total calls made (lifetime counter)
        self._budget_used: dict[str, int] = {}

    async def get_call_timestamps(self, session_id: str) -> list[float]:
        return list(self._timestamps.get(session_id, []))

    async def set_call_timestamps(self, session_id: str, timestamps: list[float]) -> None:
        self._timestamps[session_id] = timestamps

    async def get_budget_used(self, session_id: str) -> int:
        return self._budget_used.get(session_id, 0)

    async def increment_budget(self, session_id: str) -> int:
        current = self._budget_used.get(session_id, 0) + 1
        self._budget_used[session_id] = current
        return current

    # ── Observability helpers ─────────────────────────────────────────────────

    def snapshot(self) -> dict:
        """Return a point-in-time view of all session state. Useful for logging."""
        return {
            "sessions": list(self._timestamps.keys()),
            "budget_used": dict(self._budget_used),
            "active_timestamp_counts": {
                sid: len(ts) for sid, ts in self._timestamps.items()
            },
        }