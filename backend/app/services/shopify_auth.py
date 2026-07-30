"""
Shopify OAuth Service.

Handles:
  - CSRF state generation and validation.
  - Authorization URL building.
  - Access token exchange via Shopify OAuth API.
  - Store token storage (with is_demo flag tracking).
"""

from __future__ import annotations

import re
import secrets
import time
from typing import Any
import httpx

from app.config import settings

# ── In-Memory Store & OAuth State Registries ────────────────────────────────

# Short-lived state store for CSRF protection: { state: expire_timestamp }
_OAUTH_STATES: dict[str, float] = {}

# Connected store sessions: { shop_domain: { "access_token": str, "is_demo": bool, "shop": str } }
_CONNECTED_STORES: dict[str, dict[str, Any]] = {}


def sanitize_shop_domain(shop_param: str) -> str:
    """Validate and format shop parameter to clean xxxx.myshopify.com domain."""
    shop = shop_param.strip().lower()
    shop = re.sub(r"^https?://", "", shop)
    shop = shop.split("/")[0]

    if not shop.endswith(".myshopify.com"):
        if "." in shop:
            # e.g. store.com -> store.myshopify.com
            shop = f"{shop.split('.')[0]}.myshopify.com"
        else:
            shop = f"{shop}.myshopify.com"

    return shop


def generate_oauth_state() -> str:
    """Generate a random 32-char hex token and register in state cache (10 min expiry)."""
    state = secrets.token_hex(16)
    _OAUTH_STATES[state] = time.time() + 600  # 10 mins
    return state


def verify_oauth_state(state: str) -> bool:
    """Validate if OAuth state token exists and is unexpired."""
    if not state or state not in _OAUTH_STATES:
        return False

    expiry = _OAUTH_STATES.pop(state)
    return time.time() < expiry


def build_authorization_url(shop_domain: str, state: str) -> str:
    """Construct Shopify OAuth authorize redirect URL."""
    client_id = settings.SHOPIFY_API_KEY
    scopes = settings.SHOPIFY_SCOPES
    redirect_uri = settings.SHOPIFY_REDIRECT_URI

    return (
        f"https://{shop_domain}/admin/oauth/authorize?"
        f"client_id={client_id}&"
        f"scope={scopes}&"
        f"redirect_uri={redirect_uri}&"
        f"state={state}"
    )


async def exchange_code_for_token(shop_domain: str, code: str) -> str:
    """Exchange temporary OAuth code for a permanent access token."""
    token_url = f"https://{shop_domain}/admin/oauth/access_token"
    payload = {
        "client_id": settings.SHOPIFY_API_KEY,
        "client_secret": settings.SHOPIFY_API_SECRET,
        "code": code,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(token_url, json=payload)

    if resp.status_code != 200:
        raise ValueError(f"Shopify OAuth token exchange failed (HTTP {resp.status_code}): {resp.text}")

    data = resp.json()
    access_token = data.get("access_token")
    if not access_token:
        raise ValueError("Shopify OAuth response missing access_token")

    return access_token


def save_connected_store(shop_domain: str, access_token: str, is_demo: bool = False) -> None:
    """Store shop access token record."""
    _CONNECTED_STORES[shop_domain] = {
        "shop": shop_domain,
        "access_token": access_token,
        "is_demo": is_demo,
        "connected_at": time.time(),
    }
    print(f"✅ Saved store credentials for '{shop_domain}' (is_demo={is_demo})")


def get_connected_store(shop_domain: str) -> dict[str, Any] | None:
    """Lookup store record by shop domain."""
    clean_domain = sanitize_shop_domain(shop_domain)
    return _CONNECTED_STORES.get(clean_domain)
