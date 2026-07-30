"""
Results routes — approved proposals with tracked outcomes per store.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.models.result import ProposalResult
from app.services.shopify_auth import sanitize_shop_domain

router = APIRouter(prefix="/results", tags=["results"])

# Live store results registry: { clean_shop_domain: list[ProposalResult] }
_STORE_RESULTS: dict[str, list[ProposalResult]] = {}

# Seed data for demo mode only
_SEED_RESULTS: list[ProposalResult] = [
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
]


def add_store_result(store_url: str, result: ProposalResult) -> None:
    """Register an approved proposal result for a specific store."""
    clean_domain = sanitize_shop_domain(store_url or "demo")
    if clean_domain not in _STORE_RESULTS:
        _STORE_RESULTS[clean_domain] = []

    # Avoid duplicate additions
    existing_ids = {r.id for r in _STORE_RESULTS[clean_domain]}
    if result.id not in existing_ids:
        _STORE_RESULTS[clean_domain].insert(0, result)


@router.get("/", response_model=list[ProposalResult], summary="List tracked results")
async def list_results(store_url: str | None = None):
    """Return approved proposals for a specific store, or seed defaults in demo mode."""
    if store_url:
        clean_domain = sanitize_shop_domain(store_url)
        return _STORE_RESULTS.get(clean_domain, [])

    return _SEED_RESULTS
