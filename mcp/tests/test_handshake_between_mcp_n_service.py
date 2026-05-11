"""
Test suite for OpenGINTransport resilience layer.

Covers:
  - Happy path
  - Retry on connection error / server error
  - 429 with Retry-After header
  - No retry on non-retryable 4xx
  - All retries exhausted
  - Circuit breaker: trips, fast-fails, recovers
  - Total timeout budget exceeded
  - Concurrency limit (semaphore)

Run:
  pytest test_transport.py -v
  pytest test_transport.py -v -s          # show log output

Dependencies:
  pip install pytest pytest-asyncio respx
"""

import asyncio
import time

import httpx
import pytest
import pytest_asyncio
import respx

from client import OpenGINTransport, configure_logging
from client.circuit_breaker import CircuitState
from client.exceptions import (
    CircuitBreakerOpenError,
    OpenGINConnectionError,
    OpenGINError,
    OpenGINRateLimitError,
    OpenGINServerError,
    OpenGINTimeoutError,
)

configure_logging(log_level="DEBUG", json_output=False)

# ── Constants ─────────────────────────────────────────────────────────────────

BASE_URL   = "http://test-opengin.local"
ENTITY_ID  = "test-entity-001"
META_PATH  = f"{BASE_URL}/entities/{ENTITY_ID}/metadata"
SEARCH_PATH = f"{BASE_URL}/entities"

MOCK_METADATA = {"id": ENTITY_ID, "name": "Test Entity", "type": "citation"}
MOCK_SEARCH   = [{"id": ENTITY_ID, "score": 0.99}]


# ── Fixtures ──────────────────────────────────────────────────────────────────

def make_transport(**overrides) -> OpenGINTransport:
    """
    Returns a transport with fast settings suitable for unit tests.
    Override any parameter via kwargs.
    """
    defaults = dict(
        max_retries=3,
        total_timeout=5.0,
        max_concurrency=5,
        cb_failure_threshold=3,
        cb_recovery_timeout=0.5,   # short so recovery tests don't take long
    )
    defaults.update(overrides)
    return OpenGINTransport(BASE_URL, **defaults)


@pytest.fixture
def transport():
    return make_transport()


# ── 1. Happy path ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_successful_request(transport):
    """A clean 200 response returns parsed JSON immediately."""
    respx.get(META_PATH).mock(return_value=httpx.Response(200, json=MOCK_METADATA))

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert result == MOCK_METADATA
    assert transport._circuit_breaker.state == CircuitState.CLOSED


# ── 2. Retry on transient errors ──────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_retry_on_connection_error_then_success(transport):
    """
    Fails with a connection error on the first two attempts,
    then succeeds on the third. Should return the result without raising.
    """
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.ConnectError("refused"),
            httpx.ConnectError("refused"),
            httpx.Response(200, json=MOCK_METADATA),
        ]
    )

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")
    assert result == MOCK_METADATA


@pytest.mark.asyncio
@respx.mock
async def test_retry_on_503_then_success(transport):
    """Two 503s followed by a 200 — should succeed after retries."""
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.Response(503, json={"error": "unavailable"}),
            httpx.Response(503, json={"error": "unavailable"}),
            httpx.Response(200, json=MOCK_METADATA),
        ]
    )

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")
    assert result == MOCK_METADATA


@pytest.mark.asyncio
@respx.mock
async def test_retry_on_timeout_then_success(transport):
    """Per-request timeout followed by a success — should recover."""
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.ReadTimeout("timed out"),
            httpx.Response(200, json=MOCK_METADATA),
        ]
    )

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")
    assert result == MOCK_METADATA


# ── 3. 429 Rate Limiting ──────────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_429_waits_retry_after_then_succeeds(transport):
    """
    On a 429 the transport should wait the Retry-After seconds (we patch sleep
    so the test doesn't actually wait), then succeed on the next attempt.
    """
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.Response(429, headers={"Retry-After": "2"}, json={}),
            httpx.Response(200, json=MOCK_METADATA),
        ]
    )

    # Patch asyncio.sleep so the test doesn't wait 2 real seconds
    sleep_calls = []
    async def fake_sleep(seconds):
        sleep_calls.append(seconds)

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(asyncio, "sleep", fake_sleep)
        result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert result == MOCK_METADATA
    # Verify the transport respected the Retry-After value
    assert any(s >= 2.0 for s in sleep_calls), f"Expected sleep >= 2s, got {sleep_calls}"


@pytest.mark.asyncio
@respx.mock
async def test_429_uses_default_retry_after_when_header_missing(transport):
    """If the server omits Retry-After, fall back to 1.0s default."""
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.Response(429, json={}),            # no Retry-After header
            httpx.Response(200, json=MOCK_METADATA),
        ]
    )

    sleep_calls = []
    async def fake_sleep(seconds):
        sleep_calls.append(seconds)

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(asyncio, "sleep", fake_sleep)
        result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert result == MOCK_METADATA
    assert sleep_calls, "Expected at least one sleep call"
    assert sleep_calls[0] >= 1.0


# ── 4. Non-retryable errors ───────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_404_does_not_retry(transport):
    """404 is the caller's fault — should raise immediately without retrying."""
    route = respx.get(META_PATH).mock(return_value=httpx.Response(404, json={}))

    with pytest.raises(OpenGINError):
        await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert route.call_count == 1, "404 must not trigger a retry"


@pytest.mark.asyncio
@respx.mock
async def test_400_does_not_retry(transport):
    """400 Bad Request — bad input, no point retrying."""
    route = respx.get(META_PATH).mock(return_value=httpx.Response(400, json={}))

    with pytest.raises(OpenGINError):
        await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert route.call_count == 1


# ── 5. Retries exhausted ──────────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_all_retries_exhausted_raises(transport):
    """
    If every attempt fails, the last exception should propagate
    after max_retries attempts.
    """
    route = respx.get(META_PATH).mock(
        return_value=httpx.Response(503, json={"error": "down"})
    )

    with pytest.raises(OpenGINServerError):
        await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert route.call_count == transport._max_retries


@pytest.mark.asyncio
@respx.mock
async def test_all_retries_exhausted_on_connection_error(transport):
    route = respx.get(META_PATH).mock(
        side_effect=httpx.ConnectError("refused")
    )

    with pytest.raises(OpenGINConnectionError):
        await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert route.call_count == transport._max_retries


# ── 6. Circuit Breaker ────────────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_circuit_breaker_trips_after_threshold_failures(transport):
    """
    After cb_failure_threshold (3) consecutive failures the circuit opens.
    """
    respx.get(META_PATH).mock(
        return_value=httpx.Response(503, json={})
    )

    assert transport._circuit_breaker.state == CircuitState.CLOSED

    # Each request exhausts its retries → one circuit failure per request
    for _ in range(transport._circuit_breaker.failure_threshold):
        with pytest.raises((OpenGINServerError, OpenGINError)):
            await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert transport._circuit_breaker.state == CircuitState.OPEN


@pytest.mark.asyncio
@respx.mock
async def test_circuit_breaker_fast_fails_when_open(transport):
    """
    When the circuit is open, requests must be rejected immediately
    without hitting the network at all.
    """
    route = respx.get(META_PATH).mock(return_value=httpx.Response(200, json=MOCK_METADATA))

    # Manually open the circuit
    transport._circuit_breaker._state         = CircuitState.OPEN
    transport._circuit_breaker._opened_at     = time.monotonic()
    transport._circuit_breaker._failure_count = 3

    with pytest.raises(CircuitBreakerOpenError):
        await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert route.call_count == 0, "Circuit is open — no HTTP request should be made"


@pytest.mark.asyncio
@respx.mock
async def test_circuit_breaker_recovers_after_timeout(transport):
    """
    After recovery_timeout elapses (0.5s in test transport), the circuit
    moves to HALF_OPEN and lets one probe through. On success it closes.
    """
    respx.get(META_PATH).mock(return_value=httpx.Response(200, json=MOCK_METADATA))

    # Open the circuit
    transport._circuit_breaker._state         = CircuitState.OPEN
    transport._circuit_breaker._failure_count = 3
    # Back-date opened_at so recovery window has elapsed
    transport._circuit_breaker._opened_at = (
        time.monotonic() - transport._circuit_breaker.recovery_timeout - 0.1
    )

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert result == MOCK_METADATA
    assert transport._circuit_breaker.state == CircuitState.CLOSED


@pytest.mark.asyncio
@respx.mock
async def test_circuit_resets_failure_count_on_success(transport):
    """A successful request after partial failures resets the failure counter."""
    respx.get(META_PATH).mock(
        side_effect=[
            httpx.Response(503, json={}),
            httpx.Response(503, json={}),
            httpx.Response(200, json=MOCK_METADATA),  # succeeds on third attempt
        ]
    )

    result = await transport.request("GET", f"/entities/{ENTITY_ID}/metadata")

    assert result == MOCK_METADATA
    assert transport._circuit_breaker._failure_count == 0
    assert transport._circuit_breaker.state == CircuitState.CLOSED


# ── 7. Total timeout budget ───────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_total_timeout_exceeded(transport):
    """
    If retries + waits exceed the total_timeout budget, raises OpenGINTimeoutError
    regardless of individual per-request timeouts.
    """
    tight_transport = make_transport(total_timeout=0.1, max_retries=5)

    async def slow_response(_):
        await asyncio.sleep(1.0)       # longer than total budget
        return httpx.Response(200, json=MOCK_METADATA)

    respx.get(META_PATH).mock(side_effect=slow_response)

    with pytest.raises(OpenGINTimeoutError, match="Total timeout"):
        await tight_transport.request("GET", f"/entities/{ENTITY_ID}/metadata")


# ── 8. Concurrency limit ──────────────────────────────────────────────────────

@pytest.mark.asyncio
@respx.mock
async def test_semaphore_limits_concurrency():
    """
    With max_concurrency=2, firing 6 requests simultaneously should still
    all complete — semaphore queues them, not drops them.
    """
    limited_transport = make_transport(max_concurrency=2)
    call_times = []

    async def delayed_response(_):
        call_times.append(time.monotonic())
        await asyncio.sleep(0.05)
        return httpx.Response(200, json=MOCK_METADATA)

    respx.get(META_PATH).mock(side_effect=delayed_response)

    tasks = [
        limited_transport.request("GET", f"/entities/{ENTITY_ID}/metadata")
        for _ in range(6)
    ]
    results = await asyncio.gather(*tasks)

    assert len(results) == 6
    assert all(r == MOCK_METADATA for r in results)
    # With concurrency=2, requests should not all start at the same instant
    # (at least some should be queued — verified by spread in call_times)
    spread = max(call_times) - min(call_times)
    assert spread > 0.04, f"Expected queuing delay, but all started within {spread:.3f}s"