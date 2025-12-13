"""
Audit module for validating curriculum modules.

This package provides tools for auditing Ukrainian language curriculum modules,
checking grammar constraints, activity requirements, and pedagogical standards.
"""

from .core import audit_module

__all__ = ['audit_module']
