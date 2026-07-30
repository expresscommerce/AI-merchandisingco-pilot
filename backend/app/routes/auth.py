"""
Shopify OAuth Routes.

Endpoints:
  GET /auth/shopify/install?shop={shop_domain} -> Redirects to Shopify OAuth consent screen
  GET /auth/shopify/callback -> Validates CSRF state, exchanges code for access token, redirects to /dashboard?connected=true
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.config import settings
from app.services.shopify_auth import (
    build_authorization_url,
    exchange_code_for_token,
    generate_oauth_state,
    sanitize_shop_domain,
    save_connected_store,
    verify_oauth_state,
)

router = APIRouter(prefix="/auth/shopify", tags=["auth"])


@router.get("/install", summary="Initiate Shopify OAuth installation")
async def install_shopify_app(shop: str = Query(..., description="Shop domain or handle")):
    """Validate shop parameter and redirect user to Shopify authorize URL."""
    if not shop or not shop.strip():
        raise HTTPException(status_code=400, detail="Missing required 'shop' parameter")

    shop_domain = sanitize_shop_domain(shop)
    state = generate_oauth_state()
    auth_url = build_authorization_url(shop_domain, state)

    print(f"🔗 Redirecting '{shop_domain}' to Shopify OAuth: {auth_url}")
    return RedirectResponse(url=auth_url, status_code=307)


@router.get("/callback", summary="Shopify OAuth redirect callback")
async def shopify_oauth_callback(
    code: str | None = Query(None),
    shop: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
):
    """Callback route handling authorization code exchange and error redirects."""
    frontend_base = settings.FRONTEND_URL

    if error:
        print(f"❌ Shopify OAuth error received: {error}")
        return RedirectResponse(
            url=f"{frontend_base}/?error={error}",
            status_code=307,
        )

    if not code or not shop or not state:
        print("❌ Shopify OAuth callback missing parameters")
        return RedirectResponse(
            url=f"{frontend_base}/?error=Missing+OAuth+parameters",
            status_code=307,
        )

    # CSRF check
    if not verify_oauth_state(state):
        print(f"❌ Invalid or expired OAuth state token: {state}")
        return RedirectResponse(
            url=f"{frontend_base}/?error=Invalid+or+expired+OAuth+state+token",
            status_code=307,
        )

    shop_domain = sanitize_shop_domain(shop)

    try:
        access_token = await exchange_code_for_token(shop_domain, code)
        save_connected_store(shop_domain, access_token, is_demo=False)

        # Redirect to frontend dashboard with success flag
        redirect_url = f"{frontend_base}/dashboard?connected=true&shop={shop_domain}"
        print(f"🎉 OAuth success! Redirecting to {redirect_url}")
        return RedirectResponse(url=redirect_url, status_code=307)

    except Exception as exc:
        print(f"❌ Token exchange failed for {shop_domain}: {exc}")
        return RedirectResponse(
            url=f"{frontend_base}/?error=Failed+to+exchange+OAuth+token",
            status_code=307,
        )
