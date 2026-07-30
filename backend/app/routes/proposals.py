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
from app.services.agent import get_proposals_for_category

router = APIRouter(prefix="/proposals", tags=["proposals"])

# ── Seed data ───────────────────────────────────────────────────────────

_SEED: list[Proposal] = [
    PriceChangeProposal(
        id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        product_name='Lodge 10.25" Cast Iron Skillet',
        reasoning=(
            "Competitor analysis shows similar cast iron skillets priced 12-18% "
            "lower on Amazon and Target. Reducing the price by $5 should recover "
            "an estimated 340 lost add-to-carts per month while maintaining a "
            "healthy 42% gross margin."
        ),
        confidence="high",
        estimated_impact="+$4,200/mo revenue",
        current_price=34.99,
        proposed_price=29.99,
        sparkline_data=[
            3, 2, 4, 2, 3, 1, 2, 3, 2, 1, 2, 3, 2, 2, 1,
            3, 2, 1, 2, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 2,
        ],
        data_trail=[
            "Checked competitor pricing on Amazon, Target, and Walmart",
            "Analyzed 90-day price elasticity curve",
            "Verified current inventory velocity (42 units/week)",
            "Confirmed gross margin stays above 40% at new price",
            "Checked review sentiment (4.6★ avg — no quality concerns)",
        ],
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
        estimated_impact="+$1,800/mo uplift",
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
        data_trail=[
            "Scanned listing copy for keyword density and readability",
            "Compared conversion rate vs. category average (−3.2%)",
            "Ran A/B sentiment analysis on top-performing competitor listings",
            "Generated lifestyle-focused copy with social proof hooks",
        ],
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
        estimated_impact="+$8.50 AOV",
        products=[
            "Bamboo Cutting Board (Large)",
            "Walnut End-Grain Chopping Block",
            "Flexible Plastic Cutting Mat Set (3-pack)",
        ],
        discount_percent=15.0,
        co_purchase_pct=23.0,
        data_trail=[
            "Ran market-basket analysis on 90 days of order data",
            "Identified 23% co-purchase overlap across 3 SKUs",
            "Simulated AOV impact at 10%, 15%, and 20% discount tiers",
            "Verified inventory levels support bundle velocity increase",
        ],
    ),
    PriceChangeProposal(
        id="d4e5f6a7-b8c9-0123-defa-234567890123",
        product_name="Stainless Steel Water Bottle (32oz)",
        reasoning=(
            "This SKU has seen a steady decline in sales velocity over the past "
            "6 weeks despite stable traffic. Price sensitivity testing suggests "
            "a $3 reduction will recover approximately 120 units/month in volume "
            "while keeping margin above 38%."
        ),
        confidence="medium",
        estimated_impact="+$2,400/mo revenue",
        current_price=28.99,
        proposed_price=25.99,
        sparkline_data=[
            8, 9, 7, 8, 10, 9, 7, 6, 7, 5, 6, 5, 4, 5, 4,
            3, 4, 3, 3, 4, 3, 2, 3, 3, 2, 3, 2, 2, 3, 2,
        ],
        data_trail=[
            "Detected 60% decline in sales velocity over 6 weeks",
            "Confirmed traffic volume is stable (not a visibility issue)",
            "Ran price sensitivity model across 3 discount tiers",
            "Validated margin floor at $25.99 price point (38.2%)",
        ],
    ),
    CopyRewriteProposal(
        id="e5f6a7b8-c9d0-1234-efab-345678901234",
        product_name="Organic Cotton Throw Blanket",
        reasoning=(
            "Product page has a 4.1s average time-on-page vs. 6.8s category "
            "average, indicating visitors aren't engaging with the copy. "
            "Rewrite emphasizes tactile quality and gift-giving use case "
            "to increase dwell time and conversion."
        ),
        confidence="low",
        estimated_impact="+$900/mo uplift",
        current_copy=(
            "100% organic cotton throw blanket. 50x60 inches. Machine washable. "
            "Available in Natural, Charcoal, and Terracotta."
        ),
        proposed_copy=(
            "Wrap yourself in guilt-free comfort — this 100% organic cotton "
            "throw is as soft as it is sustainable. At a generous 50×60\", "
            "it's perfect draped over the couch or gifted to someone who "
            "deserves a little luxury. Machine washable, naturally. "
            "Loved by 1,800+ happy customers."
        ),
        data_trail=[
            "Measured time-on-page vs. category benchmark (4.1s vs 6.8s)",
            "Identified low engagement rate in scroll-depth analytics",
            "Analyzed top-converting competitor copy patterns",
            "Generated emotionally-driven copy with gift-giving angle",
        ],
    ),
    BundleSuggestionProposal(
        id="f6a7b8c9-d0e1-2345-fabc-456789012345",
        product_name="Home Barista Starter Kit",
        reasoning=(
            "Customers who buy the pour-over dripper also purchase the "
            "gooseneck kettle in 31% of orders and the burr grinder in 18% "
            "of orders. A curated starter kit at 12% off would simplify "
            "the buying decision and boost AOV significantly."
        ),
        confidence="high",
        estimated_impact="+$12.30 AOV",
        products=[
            "Ceramic Pour-Over Coffee Dripper",
            "Gooseneck Electric Kettle (0.8L)",
            "Conical Burr Coffee Grinder",
        ],
        discount_percent=12.0,
        co_purchase_pct=31.0,
        data_trail=[
            "Identified frequently co-purchased items via association rules",
            "Calculated 31% attach rate between dripper and kettle",
            "Modeled AOV lift at 10%, 12%, and 15% bundle discounts",
            "Confirmed all 3 SKUs have sufficient inventory for 60-day runway",
        ],
    ),
]

# In-memory store keyed by proposal ID
_store: dict[UUID, Proposal] = {p.id: p for p in _SEED}


# ── Endpoints ───────────────────────────────────────────────────────────


@router.get("/", response_model=list[Proposal], summary="List all proposals")
async def list_proposals(category: str | None = None, store_url: str | None = None):
    """Return merchandising proposals filtered by store category or live store URL."""
    category_proposals = await get_proposals_for_category(category, store_url=store_url)
    for p in category_proposals:
        _store[p.id] = p
    return category_proposals


@router.get("/{proposal_id}", response_model=Proposal, summary="Get a proposal")
async def get_proposal(proposal_id: UUID):
    proposal = _store.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

from app.services.shopify_client import update_description, update_price

@router.post(
    "/{proposal_id}/approve",
    response_model=ProposalStatusUpdate,
    summary="Approve a proposal",
)
async def approve_proposal(proposal_id: UUID, shop: str | None = None):
    """Mark a proposal as approved and execute price/copy changes on Shopify if connected."""
    proposal = _store.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.status = "approved"

    # Mark product as approved to prevent re-recommending in future AI analyses
    from app.services.agent import mark_product_as_approved
    mark_product_as_approved(shop or "default", proposal.product_name)

    # Insert newly approved proposal into live results tracker
    from app.routes.results import _RESULTS, ProposalResult
    existing_ids = {r.id for r in _RESULTS}
    if str(proposal.id) not in existing_ids:
        summary_str = f"Approved change for {proposal.product_name}"
        if proposal.type == "price_change":
            summary_str = f"Price updated to ${getattr(proposal, 'proposed_price', 0):.2f}"
        elif proposal.type == "copy_rewrite":
            summary_str = "Listing copy updated with AI conversion optimization"

        _RESULTS.insert(
            0,
            ProposalResult(
                id=str(proposal.id),
                type=proposal.type,
                product_name=proposal.product_name,
                change_summary=summary_str,
                approved_at="Just now",
                days_since_approval=0,
                tracking_status="tracking",
                outcome="Tracking live impact on your store...",
            ),
        )

    # If shop parameter provided, attempt live Shopify Admin API execution
    if shop:
        try:
            target_variant_id = str(getattr(proposal, "variant_id", None) or getattr(proposal, "product_id", None) or proposal.id)
            target_product_id = str(getattr(proposal, "product_id", None) or getattr(proposal, "variant_id", None) or proposal.id)

            if proposal.type == "price_change":
                await update_price(shop, target_variant_id, proposal.proposed_price)
            elif proposal.type == "copy_rewrite":
                await update_description(shop, target_product_id, proposal.proposed_copy)
        except Exception as e:
            print(f"⚠️ Live Shopify update attempt notice: {e}")

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
