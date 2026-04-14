"""
Pytest configuration for Django tests.

Ensures Django is properly configured before tests are collected and run.
"""

import os
import django
from django.conf import settings


def pytest_configure():
    """Configure Django settings before test collection."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    # Set ATOMIC_REQUESTS to False for all databases to avoid transaction issues in tests
    for db_alias, db_config in settings.DATABASES.items():
        db_config["ATOMIC_REQUESTS"] = False
        if "TEST" not in db_config:
            db_config["TEST"] = {}
        db_config["TEST"]["ATOMIC_REQUESTS"] = False

    # Monkey-patch Django's make_view_atomic to safely handle database settings
    # This prevents KeyError when accessing ATOMIC_REQUESTS during tests
    from django.core import handlers
    from copy import deepcopy

    _original_make_view_atomic = handlers.base.BaseHandler.make_view_atomic

    def _patched_make_view_atomic(self, view):
        """Safely handle atomic requests by using .get() instead of direct access."""
        from django.db import connections
        from django.views.decorators.http import condition

        non_atomic_requests = getattr(view, "_non_atomic_requests", set())
        for alias, settings_dict in connections.settings.items():
            # Use .get() to safely access ATOMIC_REQUESTS, defaulting to False
            if settings_dict.get("ATOMIC_REQUESTS", False):
                if alias not in non_atomic_requests:
                    return _original_make_view_atomic(self, view)
        return view

    handlers.base.BaseHandler.make_view_atomic = _patched_make_view_atomic
