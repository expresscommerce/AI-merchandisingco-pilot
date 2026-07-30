"""
Shopify Public Catalog Scraper & Currency Detector.

Fetches real product titles, prices, descriptions, and currency metadata from any public
Shopify store via its standard `/products.json` and `/cart.json` endpoints.
"""

from __future__ import annotations

import re
from typing import Any
import httpx

CURRENCY_SYMBOL_MAP = {
    "PKR": "Rs.",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "CAD": "CA$",
    "AUD": "A$",
    "INR": "₹",
    "AED": "AED ",
    "SAR": "SAR ",
}


def normalize_store_url(input_url: str) -> str:
    """Clean user input into a valid store base URL."""
    url = input_url.strip().lower()
    url = re.sub(r"^https?://", "", url)
    url = url.split("/")[0]

    if "." not in url:
        url = f"{url}.myshopify.com"

    return f"https://{url}"


def fetch_store_currency(base_url: str) -> tuple[str, str]:
    """Fetch store currency code and symbol from /cart.json."""
    cart_url = f"{base_url}/cart.json"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }
    try:
        with httpx.Client(timeout=5.0, follow_redirects=False) as client:
            resp = client.get(cart_url, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            code = data.get("currency", "USD").upper()
            symbol = CURRENCY_SYMBOL_MAP.get(code, f"{code} ")
            print(f"💱 Detected store currency: {code} ({symbol})")
            return code, symbol
    except Exception as e:
        print(f"⚠️ Currency lookup notice: {e}")
    return "USD", "$"


def fetch_shopify_store_products(store_url_or_handle: str, limit: int = 8) -> list[dict[str, Any]]:
    """Fetch public products & currency from any live Shopify store."""
    base_url = normalize_store_url(store_url_or_handle)
    target_url = f"{base_url}/products.json?limit={limit}"
    currency_code, currency_symbol = fetch_store_currency(base_url)

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }

    try:
        print(f"🌐 Fetching public products from: {target_url}")
        with httpx.Client(timeout=8.0, follow_redirects=False) as client:
            resp = client.get(target_url, headers=headers)

        if resp.status_code != 200:
            print(f"⚠️ Public products endpoint returned status {resp.status_code} for {base_url} (Store may be dev/password-protected)")
            return []

        data = resp.json()
        raw_products = data.get("products", [])

        parsed_products = []
        for p in raw_products[:limit]:
            title = p.get("title", "")
            body_html = p.get("body_html", "") or ""
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
                "currency_code": currency_code,
                "currency_symbol": currency_symbol,
            })

        print(f"✅ Successfully fetched {len(parsed_products)} live products from {base_url} ({currency_symbol})!")
        return parsed_products

    except Exception as e:
        print(f"⚠️ Shopify scraper error for {store_url_or_handle}: {e}")
        return []
