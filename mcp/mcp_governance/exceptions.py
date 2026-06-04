"""
Governance violation exceptions.

Each maps to a specific check in the governance layer.
All inherit from GovernanceViolation so tools can catch the base type if needed.
"""


class GovernanceViolation(Exception):
    """Base class for all governance violations. Hard-rejected, not retried."""
    pass


class RateLimitExceeded(GovernanceViolation):
    """
    Session has made too many tool calls in the current time window.
    Carries retry_after so the caller knows how long to wait.
    """
    def __init__(self, session_id: str, limit: int, window: float, retry_after: float):
        self.session_id  = session_id
        self.limit       = limit
        self.window      = window
        self.retry_after = retry_after
        super().__init__(
            f"Rate limit exceeded: {limit} calls per {window}s. "
            f"Retry after {retry_after:.1f}s."
        )


class ConcurrencyLimitExceeded(GovernanceViolation):
    """
    Session already has max_concurrency tool calls in-flight simultaneously.
    The agent must wait for one to finish before calling again.
    """
    def __init__(self, session_id: str, max_concurrency: int):
        self.session_id     = session_id
        self.max_concurrency = max_concurrency
        super().__init__(
            f"Too many concurrent tool calls. Max allowed: {max_concurrency}."
        )


class BudgetExceeded(GovernanceViolation):
    """
    Session has exhausted its lifetime call budget.
    No further tool calls are allowed for this session.
    """
    def __init__(self, session_id: str, budget: int):
        self.session_id = session_id
        self.budget     = budget
        super().__init__(
            f"Session call budget of {budget} exhausted. Start a new session."
        )


class InputValidationError(GovernanceViolation):
    """
    A tool argument failed validation — too long, wrong type, illegal characters.
    Indicates a misbehaving caller, not a transient error.
    """
    def __init__(self, field: str, reason: str):
        self.field  = field
        self.reason = reason
        super().__init__(f"Invalid argument '{field}': {reason}")