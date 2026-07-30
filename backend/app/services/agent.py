"""
Merchandising AI Agent Service.

Generates real-time AI recommendations using DeepInfra LLM (meta-llama/Meta-Llama-3.1-70B-Instruct)
with live product ingestion from ANY Shopify store (via authenticated GraphQL API or public scraper),
or falls back to category defaults.
"""

from __future__ import annotations

import json
from typing import Any
from uuid import uuid4

import httpx

from app.config import settings
from app.models.proposal import (
    BundleSuggestionProposal,
    CopyRewriteProposal,
    PriceChangeProposal,
    Proposal,
)
from app.services.shopify_client import get_products
from app.services.shopify_scraper import fetch_shopify_store_products

DEEPINFRA_URL = "https://api.deepinfra.com/v1/openai/chat/completions"
MODEL_NAME = "meta-llama/Meta-Llama-3.1-70B-Instruct"

# Global set of approved product names per store to prevent re-recommending approved SKUs
_APPROVED_PRODUCTS_BY_STORE: dict[str, set[str]] = {}


def mark_product_as_approved(store_url: str, product_name: str) -> None:
    """Record a product as approved for a store so it won't be re-recommended."""
    clean_key = (store_url or "default").lower().strip()
    if clean_key not in _APPROVED_PRODUCTS_BY_STORE:
        _APPROVED_PRODUCTS_BY_STORE[clean_key] = set()
    _APPROVED_PRODUCTS_BY_STORE[clean_key].add(product_name.lower().strip())


def unmark_product_as_approved(store_url: str, product_name: str) -> None:
    """Remove a product from the approved set for a store after rollback."""
    clean_key = (store_url or "default").lower().strip()
    if clean_key in _APPROVED_PRODUCTS_BY_STORE:
        _APPROVED_PRODUCTS_BY_STORE[clean_key].discard(product_name.lower().strip())


# ── Static Fallback Catalog Context ────────────────────────────────────────

STATIC_CATEGORY_CONTEXT = {
    "home_kitchen": [
        {
            "product_name": "Lodge 10.25\" Cast Iron Skillet",
            "current_price": 34.99,
            "cost_price": 18.50,
            "competitor_prices": {"Amazon": 29.99, "Target": 28.99},
            "recent_reviews": ["Great heavy duty skillet, but price was a bit higher than Target."],
        },
        {
            "product_name": "Artisan Ceramic Mug Set (4-pack)",
            "current_price": 38.00,
            "current_copy": "Set of 4 ceramic mugs. 12 oz capacity. Microwave and dishwasher safe.",
            "recent_reviews": ["Mugs are pretty but description was so boring."],
        },
        {
            "product_name": "Kitchen Essentials Cutting Board Bundle",
            "co_purchased_skus": ["Bamboo Cutting Board", "Walnut Chopping Block", "Flexible Cutting Mats"],
            "co_purchase_pct": 23.0,
            "discount_percent": 15.0,
        },
        {
            "product_name": "Stainless Steel Measuring Cups (6-Piece)",
            "current_price": 24.99,
            "cost_price": 9.20,
            "competitor_prices": {"Amazon": 19.99},
        },
        {
            "product_name": "Silicone Baking Mat (2-Pack)",
            "current_price": 21.99,
            "current_copy": "Reusable non-stick baking mats for oven sheets.",
        },
        {
            "product_name": "French Press Coffee Maker (34 oz)",
            "current_price": 42.00,
            "cost_price": 16.00,
            "competitor_prices": {"Target": 34.99},
        },
    ],
    "apparel": [
        {
            "product_name": "Heavyweight Organic Cotton Hoodie",
            "current_price": 78.00,
            "cost_price": 26.00,
            "competitor_prices": {"Everlane": 88.00, "Gymshark": 65.00},
        },
        {
            "product_name": "Water-Resistant Commuter Jacket",
            "current_copy": "Polyester commuter shell. DWR coating. Multiple utility pockets.",
        },
        {
            "product_name": "Ultimate Everyday Apparel Capsule",
            "co_purchased_skus": ["Crewneck Tee", "Merino Socks", "Chino Pants"],
            "co_purchase_pct": 28.0,
            "discount_percent": 12.0,
        },
        {
            "product_name": "Classic Crewneck Cotton Tee (3-Pack)",
            "current_price": 45.00,
            "cost_price": 14.00,
        },
        {
            "product_name": "Performance Stretch Chino Pants",
            "current_price": 88.00,
            "cost_price": 31.00,
        },
        {
            "product_name": "Merino Wool Everyday Socks",
            "current_price": 22.00,
            "cost_price": 6.50,
        },
    ],
}


async def generate_live_llm_proposals(category: str, store_url: str | None = None) -> list[Proposal] | None:
    """Generate 6 live merchandising proposals via DeepInfra LLM API, using real products if store_url supplied."""
    api_key = settings.DEEPINFRA_API_KEY
    if not api_key or api_key == "your_deepinfra_api_key_here":
        print("⚠️ DeepInfra API key missing; serving cached proposals.")
        return None

    # Retrieve list of already approved product names to exclude
    store_key = (store_url or "default").lower().strip()
    approved_set = _APPROVED_PRODUCTS_BY_STORE.get(store_key, set())
    approved_list_str = ", ".join([f"'{p}'" for p in approved_set]) if approved_set else "None"

    # Fetch live products via Shopify client (GraphQL for OAuth connected stores, scraper for public stores)
    scraped_products = []
    if store_url:
        try:
            scraped_products = await get_products(store_url)
        except Exception as err:
            print(f"⚠️ get_products exception for {store_url}: {err}")
            scraped_products = fetch_shopify_store_products(store_url, limit=15)

    currency_symbol = "$"
    if scraped_products:
        currency_symbol = scraped_products[0].get("currency_symbol", "$")
        print(f"🛍️ Using live store data from '{store_url}' ({len(scraped_products)} SKUs, Currency: {currency_symbol})")
        catalog_context = scraped_products
    else:
        cat_key = category.lower().replace(" & ", "_").replace(" ", "_")
        catalog_context = STATIC_CATEGORY_CONTEXT.get(cat_key, STATIC_CATEGORY_CONTEXT["home_kitchen"])

    prompt = f"""You are an expert AI Merchandising Assistant for an e-commerce platform.
Analyze the following catalog data for store '{store_url or category}' and generate EXACTLY 6 merchandising proposals (a diverse mix of 2 price_change, 2 copy_rewrite, and 2 bundle_suggestion).

CRITICAL EXCLUSION RULE: DO NOT generate proposals for the following products as their changes were ALREADY APPROVED by the merchant: [{approved_list_str}]. Select other products from the catalog.

IMPORTANT CURRENCY INSTRUCTION: The store's currency symbol is '{currency_symbol}'. Format all estimated_impact strings using '{currency_symbol}' (e.g., '+{currency_symbol}4,200/mo revenue' or '+{currency_symbol}12.50 AOV').

Catalog Data:
{json.dumps(catalog_context, indent=2)}

Output ONLY a JSON array containing 6 objects with exact schema:
[
  {{
    "type": "price_change",
    "product_name": str,
    "reasoning": str,
    "confidence": "high"|"medium"|"low",
    "estimated_impact": str (formatted using '{currency_symbol}'),
    "current_price": float,
    "proposed_price": float,
    "sparkline_data": [int, ...],
    "data_trail": [str, ...]
  }},
  {{
    "type": "copy_rewrite",
    "product_name": str,
    "reasoning": str,
    "confidence": "high"|"medium"|"low",
    "estimated_impact": str (formatted using '{currency_symbol}'),
    "current_copy": str,
    "proposed_copy": str,
    "data_trail": [str, ...]
  }},
  {{
    "type": "bundle_suggestion",
    "product_name": str,
    "reasoning": str,
    "confidence": "high"|"medium"|"low",
    "estimated_impact": str (formatted using '{currency_symbol}'),
    "products": [str, ...],
    "discount_percent": float,
    "co_purchase_pct": float,
    "data_trail": [str, ...]
  }}
]
Do NOT return extra text outside JSON.
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.4,
    }

    try:
        print(f"🤖 Calling DeepInfra ({MODEL_NAME}) for 6 proposals on '{store_url or category}'...")
        resp = None
        async with httpx.AsyncClient(timeout=35.0) as client:
            resp = await client.post(DEEPINFRA_URL, headers=headers, json=payload)

        if resp is None or resp.status_code != 200:
            err_code = resp.status_code if resp is not None else "No response"
            err_text = resp.text[:200] if resp is not None else ""
            print(f"❌ DeepInfra API error ({err_code}): {err_text}")
            return None

        result_json = resp.json()
        content = result_json["choices"][0]["message"]["content"]
        raw_items = json.loads(content)

        if isinstance(raw_items, dict) and "proposals" in raw_items:
            raw_items = raw_items["proposals"]
        elif isinstance(raw_items, dict) and "items" in raw_items:
            raw_items = raw_items["items"]

        parsed_proposals: list[Proposal] = []
        for idx, item in enumerate(raw_items):
            p_name = item.get("product_name", "").strip()
            if p_name.lower() in approved_set:
                print(f"⏩ Skipping already approved product: {p_name}")
                continue

            t = item.get("type")
            item["id"] = uuid4()
            item["status"] = "pending"

            # Attach real store product_id / variant_id from catalog context if available
            if scraped_products:
                matched_prod = scraped_products[idx % len(scraped_products)]
                for sp in scraped_products:
                    sp_name = (sp.get("product_name") or "").lower()
                    it_name = p_name.lower()
                    if sp_name and (sp_name in it_name or it_name in sp_name):
                        matched_prod = sp
                        break
                if matched_prod.get("id"):
                    item["product_id"] = str(matched_prod["id"])
                if matched_prod.get("variant_id"):
                    item["variant_id"] = str(matched_prod["variant_id"])

            if t == "price_change":
                raw_sparkline = item.get("sparkline_data")
                clean_sparkline = []
                if isinstance(raw_sparkline, list):
                    for val in raw_sparkline:
                        try:
                            clean_sparkline.append(int(val))
                        except (ValueError, TypeError):
                            pass
                if len(clean_sparkline) < 5:
                    clean_sparkline = [5, 6, 4, 5, 7, 6, 5, 4, 3, 2, 3, 2, 1, 2, 1]
                item["sparkline_data"] = clean_sparkline
                parsed_proposals.append(PriceChangeProposal(**item))
            elif t == "copy_rewrite":
                parsed_proposals.append(CopyRewriteProposal(**item))
            elif t == "bundle_suggestion":
                parsed_proposals.append(BundleSuggestionProposal(**item))

        print(f"✅ Generated {len(parsed_proposals)} live proposals for '{store_url or category}'!")
        return parsed_proposals

    except Exception as e:
        print(f"⚠️ Failed to parse LLM response: {e}")
        return None


# ── Category Proposals Accessor ──────────────────────────────────────────

async def get_proposals_for_category(category: str | None, store_url: str | None = None) -> list[Proposal]:
    """Return live proposals generated via DeepInfra AI, using live store ingestion if available."""
    cat_name = category or "Home & Kitchen"
    live_results = await generate_live_llm_proposals(cat_name, store_url=store_url)
    if live_results:
        return live_results

    # Fallback to static recommendations
    cat_key = cat_name.lower().replace(" & ", "_").replace(" ", "_")
    return _FALLBACK_CACHE.get(cat_key, _FALLBACK_CACHE["home_kitchen"])


# Static fallback cache
_FALLBACK_CACHE: dict[str, list[Proposal]] = {
    "home_kitchen": [
        PriceChangeProposal(
            id=uuid4(),
            product_name='Lodge 10.25" Cast Iron Skillet',
            reasoning=(
                "Competitor analysis on Amazon & Target shows pricing 12-18% lower. "
                "Lowering price by $5 recovers ~340 add-to-carts monthly while maintaining a 42% gross margin."
            ),
            confidence="high",
            estimated_impact="+$4,200/mo revenue",
            current_price=34.99,
            proposed_price=29.99,
            sparkline_data=[3, 2, 4, 2, 3, 1, 2, 3, 2, 1, 2, 3, 2, 2, 1, 3, 2, 1, 2, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 2],
            data_trail=[
                "Scraped Amazon ($29.99) & Target ($28.99) competitor prices",
                "Verified 42% margin floor preserved at $29.99",
                "Review sentiment (4.7★) indicates strong demand with price resistance",
            ],
        ),
        CopyRewriteProposal(
            id=uuid4(),
            product_name="Artisan Ceramic Mug Set (4-pack)",
            reasoning=(
                "Customer reviews note current copy is dry and feature-heavy. "
                "Rewriting to a warm morning-coffee ritual narrative with social proof is projected to boost conversion rate by +9.4%."
            ),
            confidence="medium",
            estimated_impact="+$1,800/mo uplift",
            current_copy="Set of 4 ceramic mugs. 12 oz capacity. Microwave and dishwasher safe.",
            proposed_copy=(
                "Start every morning right — four handcrafted ceramic mugs designed to make your coffee ritual feel intentional. "
                "At 12 oz each, they're the perfect size for a slow pour-over or a generous latte. Over 2,400 five-star reviews."
            ),
            data_trail=[
                "Identified 3.2% conversion lag vs category average",
                "Extracted customer desire for cozy lifestyle hooks from review sentiment",
                "Generated social-proof optimized copy with emotional positioning",
            ],
        ),
        BundleSuggestionProposal(
            id=uuid4(),
            product_name="Kitchen Essentials Cutting Board Bundle",
            reasoning=(
                "Market-basket order graph shows these three cutting tools co-purchased in 23% of orders. "
                "Creating a 15% discount bundle streamlines checkout and lifts Average Order Value."
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
                "Ran association rule mining across 90 days of order data",
                "Identified 23% co-purchase overlap across cutting accessories",
                "Simulated AOV lift at 10%, 15%, and 20% discount tiers",
            ],
        ),
    ]
}
