class OpenGINError(Exception):
    """Generic error for OpenGIN client operations."""
    pass

class OpenGINTimeoutError(OpenGINError):
    """Raised when an OpenGIN API request times out."""
    pass

class OpenGINConnectionError(OpenGINError):
    """Raised when a connection error occurs during OpenGIN API requests."""
    pass

class OpenGINServerError(OpenGINError):
    """Raised when an OpenGIN API server error occurs."""
    pass