"""
Sliding window rate limiter.

Unlike a fixed window (which resets counts at hard boundaries and allows
bursting at the boundary), a sliding window tracks exact call timestamps
and always looks back exactly `window` seconds from *now*.

Example: limit=5, window=60s
  - calls at t=0,10,20,30,40 → 5 calls in window → next call at t=0 rejected
  - at t=61, the t=0 call has slid out → allowed again

This is stricter and fairer than a fixed window.
"""

import time

from .exceptions import RateLimitExceeded
from .store import GovernanceStore


class SlidingWindowRateLimiter:
    def __init__(
        self,
        store: GovernanceStore,
        limit: int,
        window: float,
    ):
        """
        Args:
            store:  state backend (InMemoryStore or RedisStore)
            limit:  max calls allowed within the window
            window: window size in seconds
        """
        self._store  = store
        self._limit  = limit
        self._window = window

    async def check_and_record(self, session_id: str) -> int:
        """
        Check whether this call is allowed, record it if so.

        Returns:
            Remaining calls in the current window.

        Raises:
            RateLimitExceeded if the limit has been hit.
        """
        now       = time.monotonic()
        cutoff    = now - self._window
        raw       = await self._store.get_call_timestamps(session_id)

        # Drop timestamps that have slid out of the window
        active = [t for t in raw if t > cutoff]

        if len(active) >= self._limit:
            # Oldest timestamp in the window tells us when a slot opens up
            oldest      = min(active)
            retry_after = round(self._window - (now - oldest), 1)
            raise RateLimitExceeded(
                session_id  = session_id,
                limit       = self._limit,
                window      = self._window,
                retry_after = max(retry_after, 0.1),
            )

        active.append(now)
        await self._store.set_call_timestamps(session_id, active)

        return self._limit - len(active)