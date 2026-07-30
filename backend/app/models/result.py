"""
Results models — approved proposals with tracked outcomes.
"""

from __future__ import annotations

from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ProposalResult(BaseModel):
    """An approved proposal that has a tracked outcome."""

    id: UUID = Field(default_factory=uuid4)
    type: Literal["price_change", "copy_rewrite", "bundle_suggestion"]
    product_name: str
    change_summary: str
    approved_at: str           # human-readable date string
    days_since_approval: int
    tracking_status: Literal["tracking", "measured"] = "tracking"
    outcome: str | None = None  # measured result or None if still tracking
