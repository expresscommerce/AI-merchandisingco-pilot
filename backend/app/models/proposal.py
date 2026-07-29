"""
Merchandising proposal models (Pydantic schemas).

Three proposal subtypes share a common base:
  - price_change
  - copy_rewrite
  - bundle_suggestion
"""

from __future__ import annotations

from typing import Annotated, Literal, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ── Confidence & Status literals ────────────────────────────────────────

Confidence = Literal["low", "medium", "high"]
ProposalStatus = Literal["pending", "approved", "rejected"]
ProposalType = Literal["price_change", "copy_rewrite", "bundle_suggestion"]


# ── Base ────────────────────────────────────────────────────────────────


class ProposalBase(BaseModel):
    """Fields shared by every proposal type."""

    id: UUID = Field(default_factory=uuid4)
    type: ProposalType
    product_name: str
    reasoning: str
    confidence: Confidence
    estimated_impact: str
    status: ProposalStatus = "pending"


# ── Subtypes ────────────────────────────────────────────────────────────


class PriceChangeProposal(ProposalBase):
    """Suggest a new price for a product."""

    type: Literal["price_change"] = "price_change"
    current_price: float
    proposed_price: float


class CopyRewriteProposal(ProposalBase):
    """Suggest updated marketing copy."""

    type: Literal["copy_rewrite"] = "copy_rewrite"
    current_copy: str
    proposed_copy: str


class BundleSuggestionProposal(ProposalBase):
    """Suggest bundling multiple products together."""

    type: Literal["bundle_suggestion"] = "bundle_suggestion"
    products: list[str]
    discount_percent: float


# ── Discriminated union ─────────────────────────────────────────────────

Proposal = Annotated[
    Union[PriceChangeProposal, CopyRewriteProposal, BundleSuggestionProposal],
    Field(discriminator="type"),
]


# ── Status update schema ───────────────────────────────────────────────


class ProposalStatusUpdate(BaseModel):
    """Response after approving / rejecting a proposal."""

    id: UUID
    status: ProposalStatus
