"""
Proposal routes — list, approve, and reject merchandising proposals.

Uses an in-memory store seeded with example data for now.
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.proposal import (
    BundleSuggestionProposal,
    CopyRewriteProposal,
    PriceChangeProposal,
    Proposal,
    ProposalStatusUpdate,
)

router = APIRouter(prefix="/proposals", tags=["proposals"])

# ── Seed data ───────────────────────────────────────────────────────────

_SEED: list[Proposal] = [
    PriceChangeProposal(
        id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        product_name="Lodge 10.25\" Cast Iron Skillet",
        reasoning=(
            "Competitor analysis shows similar cast iron skillets priced 12-18% "
            "lower on Amazon and Target. Reducing the price by $5 should recover "
            "an estimated 340 lost add-to-carts per month while maintaining a "
            "healthy 42% gross margin."
        ),
        confidence="high",
        estimated_impact="+15% unit sales, +$4,200/mo revenue",
        current_price=34.99,
        proposed_price=29.99,
    ),
    CopyRewriteProposal(
        id="b2c3d4e5-f6a7-8901-bcde-f12345678901",
        product_name="Artisan Ceramic Mug Set (4-pack)",
        reasoning=(
            "Current listing copy is feature-heavy but lacks emotional hooks. "
            "A/B tests on similar SKUs show lifestyle-oriented copy increases "
            "conversion rate by 8-12%. The rewrite leads with a cozy morning "
            "ritual angle and adds social proof."
        ),
        confidence="medium",
        estimated_impact="+10% conversion rate, ~$1,800/mo uplift",
        current_copy=(
            "Set of 4 ceramic mugs. 12 oz capacity. Microwave and dishwasher "
            "safe. Available in Matte White, Sage Green, and Dusty Rose."
        ),
        proposed_copy=(
            "Start every morning right — four handcrafted ceramic mugs designed "
            "to make your coffee ritual feel intentional. At 12 oz each, they're "
            "the perfect size for a slow pour-over or a generous latte. "
            "Dishwasher & microwave safe, because beautiful things should be "
            "easy to live with. Over 2,400 five-star reviews."
        ),
    ),
    BundleSuggestionProposal(
        id="c3d4e5f6-a7b8-9012-cdef-123456789012",
        product_name="Kitchen Essentials Cutting Board Bundle",
        reasoning=(
            "Market-basket analysis of the last 90 days shows these three "
            "cutting boards are purchased together in 23% of orders containing "
            "any one of them. Offering a bundle at a 15% discount should "
            "increase average order value and reduce decision fatigue."
        ),
        confidence="high",
        estimated_impact="+$8.50 AOV, +22% attach rate",
        products=[
            "Bamboo Cutting Board (Large)",
            "Walnut End-Grain Chopping Block",
            "Flexible Plastic Cutting Mat Set (3-pack)",
        ],
        discount_percent=15.0,
    ),
]

# In-memory store keyed by proposal ID
_store: dict[UUID, Proposal] = {p.id: p for p in _SEED}


# ── Endpoints ───────────────────────────────────────────────────────────


@router.get("/", response_model=list[Proposal], summary="List all proposals")
async def list_proposals():
    """Return every merchandising proposal (all statuses)."""
    return list(_store.values())


@router.get("/{proposal_id}", response_model=Proposal, summary="Get a proposal")
async def get_proposal(proposal_id: UUID):
    proposal = _store.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal


@router.post(
    "/{proposal_id}/approve",
    response_model=ProposalStatusUpdate,
    summary="Approve a proposal",
)
async def approve_proposal(proposal_id: UUID):
    """Mark a proposal as approved (no Shopify call yet)."""
    proposal = _store.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "approved"
    return ProposalStatusUpdate(id=proposal.id, status=proposal.status)


@router.post(
    "/{proposal_id}/reject",
    response_model=ProposalStatusUpdate,
    summary="Reject a proposal",
)
async def reject_proposal(proposal_id: UUID):
    """Mark a proposal as rejected."""
    proposal = _store.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "rejected"
    return ProposalStatusUpdate(id=proposal.id, status=proposal.status)
