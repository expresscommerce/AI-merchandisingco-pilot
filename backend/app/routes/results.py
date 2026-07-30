"""
Results routes — approved proposals with tracked outcomes.
"""

from fastapi import APIRouter

from app.models.result import ProposalResult

router = APIRouter(prefix="/results", tags=["results"])

# ── Seed data — realistic tracked outcomes ──────────────────────────────

_RESULTS: list[ProposalResult] = [
    ProposalResult(
        id="11111111-1111-1111-1111-111111111111",
        type="price_change",
        product_name="Handmade Olive Wood Spatula",
        change_summary="Price reduced from $18.99 → $14.99",
        approved_at="Jul 22, 2026",
        days_since_approval=7,
        tracking_status="measured",
        outcome="18 units sold since approval, vs. 4 in prior 6 weeks",
    ),
    ProposalResult(
        id="22222222-2222-2222-2222-222222222222",
        type="copy_rewrite",
        product_name="Linen Napkin Set (6-pack)",
        change_summary="Listing copy rewritten with lifestyle-focused angle",
        approved_at="Jul 20, 2026",
        days_since_approval=9,
        tracking_status="measured",
        outcome="Conversion rate up from 1.8% → 3.1% (+72%)",
    ),
    ProposalResult(
        id="33333333-3333-3333-3333-333333333333",
        type="bundle_suggestion",
        product_name="Breakfast-in-Bed Bundle",
        change_summary="Created bundle: Tray + Mug Set + French Press at 12% off",
        approved_at="Jul 25, 2026",
        days_since_approval=4,
        tracking_status="measured",
        outcome="AOV increased from $34.20 → $48.70 on bundle orders",
    ),
    ProposalResult(
        id="44444444-4444-4444-4444-444444444444",
        type="price_change",
        product_name="Silicone Baking Mat (2-pack)",
        change_summary="Price reduced from $22.99 → $19.99",
        approved_at="Jul 28, 2026",
        days_since_approval=1,
        tracking_status="tracking",
        outcome=None,
    ),
    ProposalResult(
        id="55555555-5555-5555-5555-555555555555",
        type="copy_rewrite",
        product_name="Recycled Glass Tumbler Set",
        change_summary="Description rewritten to emphasize sustainability story",
        approved_at="Jul 29, 2026",
        days_since_approval=0,
        tracking_status="tracking",
        outcome=None,
    ),
]


@router.get("/", response_model=list[ProposalResult], summary="List tracked results")
async def list_results():
    """Return approved proposals with their tracked outcomes."""
    return _RESULTS
