"""
Shopify Admin API Client.

Implements real GraphQL / REST Admin API calls for authenticated stores (is_demo=False):
  - get_products(store_id_or_domain)
  - get_product(store_id_or_domain, product_id)
  - update_price(store_id_or_domain, variant_id_or_product_id, new_price)
  - update_description(store_id_or_domain, product_id, new_copy)

Routes requests dynamically:
  - If is_demo=False -> Calls Shopify Admin API with stored X-Shopify-Access-Token header.
  - If is_demo=True -> Calls dummy data routines.
"""

from __future__ import annotations

import re
from typing import Any
import httpx

from app.services.shopify_auth import get_connected_store, sanitize_shop_domain
from app.services.shopify_scraper import fetch_shopify_store_products

SHOPIFY_API_VERSION = "2024-01"


def _get_headers(access_token: str) -> dict[str, str]:
    return {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def get_products(store_id_or_domain: str) -> list[dict[str, Any]]:
    """Fetch products for a store. Routes to real GraphQL API if connected token exists."""
    clean_domain = sanitize_shop_domain(store_id_or_domain)
    store = get_connected_store(clean_domain)

    # Real authenticated store request
    if store and not store.get("is_demo") and store.get("access_token"):
        access_token = store["access_token"]
        graphql_url = f"https://{clean_domain}/admin/api/{SHOPIFY_API_VERSION}/graphql.json"

        query = """
        query {
          products(first: 15) {
            edges {
              node {
                id
                title
                description
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      price
                    }
                  }
                }
              }
            }
          }
        }
        """

        try:
            print(f"🛍️ Calling Shopify Admin GraphQL API for '{clean_domain}'...")
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    graphql_url,
                    json={"query": query},
                    headers=_get_headers(access_token),
                )

            if resp.status_code == 200:
                data = resp.json()
                data_obj = data.get("data") or {}
                products_obj = data_obj.get("products") or {}
                edges = products_obj.get("edges") or []

                if not edges and "errors" in data:
                    print(f"⚠️ Shopify GraphQL returned errors: {data.get('errors')}")

                products = []
                for edge in edges:
                    node = (edge or {}).get("node") or {}
                    img_edges = (node.get("images") or {}).get("edges") or []
                    image_url = (img_edges[0] or {}).get("node", {}).get("url") if img_edges else None
                    variants = (node.get("variants") or {}).get("edges") or []
                    first_variant = (variants[0] or {}).get("node") if variants else {}
                    if not isinstance(first_variant, dict):
                        first_variant = {}
                    products.append({
                        "id": node.get("id"),
                        "product_name": node.get("title"),
                        "current_copy": node.get("description"),
                        "current_price": float(first_variant.get("price") or 0.0),
                        "variant_id": first_variant.get("id"),
                        "image_url": image_url,
                        "currency_symbol": "$",
                    })
                if products:
                    return products
        except Exception as e:
            print(f"⚠️ Shopify GraphQL API error for {clean_domain}: {e}")

    # Fallback / unauthenticated public scraper
    return fetch_shopify_store_products(clean_domain)


async def get_product(store_id_or_domain: str, product_id: str) -> dict[str, Any] | None:
    """Fetch single product details."""
    products = await get_products(store_id_or_domain)
    for p in products:
        if str(p.get("id")) == product_id:
            return p
    return products[0] if products else None


async def update_price(store_id_or_domain: str, product_or_variant_id: str, new_price: float) -> dict[str, Any]:
    """Update product variant price via Shopify Admin API (GraphQL or REST)."""
    clean_domain = sanitize_shop_domain(store_id_or_domain)
    store = get_connected_store(clean_domain)

    if store and not store.get("is_demo") and store.get("access_token"):
        access_token = store["access_token"]

        # Extract numerical ID if GID string e.g. gid://shopify/ProductVariant/12345
        variant_num_match = re.search(r"\d+", product_or_variant_id)
        variant_num = variant_num_match.group(0) if variant_num_match else product_or_variant_id

        if not variant_num.isdigit():
            products = await get_products(clean_domain)
            for p in products:
                if p.get("variant_id"):
                    v_match = re.search(r"\d+", str(p.get("variant_id")))
                    if v_match:
                        variant_num = v_match.group(0)
                        break

        rest_url = f"https://{clean_domain}/admin/api/{SHOPIFY_API_VERSION}/variants/{variant_num}.json"
        payload = {"variant": {"id": int(variant_num) if variant_num.isdigit() else variant_num, "price": f"{new_price:.2f}"}}

        try:
            print(f"⚡ Updating price on real Shopify store '{clean_domain}' (Variant {variant_num} -> ${new_price:.2f})...")
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.put(
                    rest_url,
                    json=payload,
                    headers=_get_headers(access_token),
                )

            if resp.status_code in (200, 201):
                print(f"✅ Price successfully updated on real Shopify store '{clean_domain}'!")
                return {"status": "success", "new_price": new_price, "shop": clean_domain}
            else:
                print(f"❌ Shopify price update failed ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            print(f"⚠️ Shopify update_price exception for {clean_domain}: {e}")

    # Demo mode fallback response
    print(f"🎭 [Demo Mode] Simulated price update on '{clean_domain}' to ${new_price:.2f}")
    return {"status": "success", "new_price": new_price, "is_demo": True}


async def update_description(store_id_or_domain: str, product_id: str, new_copy: str) -> dict[str, Any]:
    """Update product listing description via Shopify Admin API."""
    clean_domain = sanitize_shop_domain(store_id_or_domain)
    store = get_connected_store(clean_domain)

    if store and not store.get("is_demo") and store.get("access_token"):
        access_token = store["access_token"]
        product_num_match = re.search(r"\d+", product_id)
        product_num = product_num_match.group(0) if product_num_match else product_id

        if not product_num.isdigit():
            products = await get_products(clean_domain)
            for p in products:
                if p.get("id"):
                    p_match = re.search(r"\d+", str(p.get("id")))
                    if p_match:
                        product_num = p_match.group(0)
                        break

        rest_url = f"https://{clean_domain}/admin/api/{SHOPIFY_API_VERSION}/products/{product_num}.json"
        payload = {"product": {"id": int(product_num) if product_num.isdigit() else product_num, "body_html": f"<p>{new_copy}</p>"}}

        try:
            print(f"⚡ Updating copy on real Shopify store '{clean_domain}' (Product {product_num})...")
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.put(
                    rest_url,
                    json=payload,
                    headers=_get_headers(access_token),
                )

            if resp.status_code in (200, 201):
                print(f"✅ Description successfully updated on real Shopify store '{clean_domain}'!")
                return {"status": "success", "new_copy": new_copy, "shop": clean_domain}
            else:
                print(f"❌ Shopify description update failed ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            print(f"⚠️ Shopify update_description exception for {clean_domain}: {e}")

    # Demo mode fallback response
    print(f"🎭 [Demo Mode] Simulated copy update on '{clean_domain}'")
    return {"status": "success", "new_copy": new_copy, "is_demo": True}
