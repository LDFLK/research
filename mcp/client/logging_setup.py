"""
Structured logging setup using structlog.

Call configure_logging() once at application startup (e.g. in main.py / server.py).

Output modes:
  - Production (json_output=True)  → one JSON object per line, ready for log aggregators
                                     (Datadog, Loki, CloudWatch, etc.)
  - Development (json_output=False) → coloured human-readable console output

Every log line automatically includes:
  timestamp  — ISO-8601 UTC
  level      — debug / info / warning / error / critical
  logger     — dotted module name (e.g. opengin.transport)
  + any key=value pairs bound at call site via log.bind() or log.info("event", key=val)

Example JSON line:
  {
    "timestamp": "2024-11-15T09:32:01.432Z",
    "level": "warning",
    "logger": "opengin.transport",
    "event": "rate_limited",
    "service": "opengin",
    "method": "GET",
    "url": "/entities/abc/metadata",
    "retry_after_s": 2.0
  }
"""

import logging
import structlog


def configure_logging(
    log_level: str = "INFO",
    json_output: bool = True,
) -> None:
    """
    Args:
        log_level:   minimum log level — "DEBUG" | "INFO" | "WARNING" | "ERROR"
        json_output: True  → JSON lines (production)
                     False → coloured console (development)

    Uses structlog on top of stdlib logging so that:
      - add_logger_name works correctly (stdlib loggers have .name)
      - log output can be routed via standard logging handlers/config
    """
    level = getattr(logging, log_level.upper())

    # Configure stdlib root logger first — structlog delegates to it
    logging.basicConfig(
        format="%(message)s",   # structlog owns the full formatting
        level=level,
    )

    # Processors shared by both output modes.
    # These run in order on every log record before rendering.
    shared_processors = [
        structlog.contextvars.merge_contextvars,       # thread/async-local context
        structlog.processors.add_log_level,            # adds "level" key
        structlog.stdlib.add_logger_name,              # adds "logger" key (.name from stdlib)
        structlog.processors.TimeStamper(fmt="iso"),   # adds "timestamp" key
        structlog.processors.StackInfoRenderer(),      # renders stack_info if present
    ]

    if json_output:
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,      # exception → structured dict
            structlog.processors.JSONRenderer(),
        ]
    else:
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),   # ← stdlib, not PrintLoggerFactory
        cache_logger_on_first_use=True,
    )