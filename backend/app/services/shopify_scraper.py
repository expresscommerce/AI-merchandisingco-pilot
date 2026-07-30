"""
Shopify Public Catalog Scraper.

Fetches real product titles, prices, descriptions, and metadata from any public
Shopify store via its standard `/products.json` endpoint.
"""

from __future__ import annotations

import re
from typing import Any
import httpx


def normalize_store_url(input_url: str) -> str:
    """Clean user input into a valid store base URL."""
    url = input_url.strip().lower()
    # Remove protocol
    url = re.sub(r"^https?://", "", url)
    # Remove trailing slash and path
    url = url.split("/")[0]

    # If simple name without dot (e.g., "gymshark"), append .myshopify.com
    if "." not in url:
        url = f"{url}.myshopify.com"

    return f"https://{url}"


def fetch_shopify_store_products(store_url_or_handle: str, limit: int = 8) -> list[dict[str, Any]]:
    """Fetch public products from any live Shopify store via products.json."""
    base_url = normalize_store_url(store_url_or_handle)
    target_url = f"{base_url}/products.json?limit={limit}"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }

    try:
        print(f"🌐 Fetching live Shopify products from: {target_url}")
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            resp = client.get(target_url, headers=headers)

        if resp.status_code != 200:
            print(f"⚠️ Unable to fetch products from {target_url} (HTTP {resp.status_code})")
            return []

        data = resp.json()
        raw_products = data.get("products", [])

        parsed_products = []
        for p in raw_products[:limit]:
            title = p.get("title", "")
            body_html = p.get("body_html", "") or ""
            # Strip simple HTML tags from description
            clean_desc = re.sub(r"<[^>]+>", " ", body_html).strip()
            clean_desc = re.sub(r"\s+", " ", clean_desc)[:200]

            variants = p.get("variants", [])
            first_variant = variants[0] if variants else {}
            price = float(first_variant.get("price", 0.0) or 0.0)

            parsed_products.append({
                "id": str(p.get("id")),
                "product_name": title,
                "current_price": price,
                "current_copy": clean_desc or title,
                "vendor": p.get("vendor", ""),
            })

        print(f"✅ Successfully fetched {len(parsed_products)} live products from {base_url}!")
        return parsed_products

    except Exception as e:
        print(f"⚠️ Shopify scraper error for {store_url_or_handle}: {e}")
        return []
