"""Jittered exponential backoff between retries of contended writes."""

import random

_BASE_SECONDS = 0.05
_CAP_SECONDS = 0.4
# SystemRandom: no seeded global state, and ruff's S311 stays quiet.
_RANDOM = random.SystemRandom()


def backoff_delay(attempt: int) -> float:
    """Return a "full jitter" delay before retry number ``attempt``.

    The upper bound doubles with each attempt (50 ms, 100 ms, ...) and is
    capped at 400 ms; the delay is drawn uniformly below it, so writers
    that collided once do not collide again in lockstep.

    Parameters
    ----------
    attempt : int
        Zero-based retry number.

    Returns
    -------
    float
        Delay in seconds, between 0 and the bound for ``attempt``.
    """
    return _RANDOM.uniform(0, min(_CAP_SECONDS, _BASE_SECONDS * 2**attempt))
