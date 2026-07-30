"""
Background Scheduler — periodic AI analysis cron job for connected stores.

Runs every 6 hours to re-analyze all connected stores and pre-generate
fresh proposals so merchants always see up-to-date recommendations.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Interval in seconds (6 hours = 21600)
ANALYSIS_INTERVAL_SECONDS = 6 * 60 * 60

# In-memory cache of latest scheduled proposals per store
_SCHEDULED_PROPOSALS: dict[str, list] = {}

_scheduler_task: asyncio.Task | None = None


async def _run_scheduled_analysis() -> None:
    """Periodically re-analyze all connected stores."""
    from app.services.shopify_auth import _CONNECTED_STORES
    from app.services.agent import generate_live_llm_proposals

    while True:
        await asyncio.sleep(ANALYSIS_INTERVAL_SECONDS)

        connected = dict(_CONNECTED_STORES)
        if not connected:
            logger.info("⏰ Scheduled analysis: no connected stores, skipping.")
            continue

        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        logger.info(f"⏰ Scheduled analysis started at {timestamp} for {len(connected)} store(s)")

        for shop_domain, store_info in connected.items():
            if store_info.get("is_demo"):
                continue

            try:
                logger.info(f"⏰ Analyzing store: {shop_domain}")
                proposals = await generate_live_llm_proposals("General", store_url=shop_domain)
                if proposals:
                    _SCHEDULED_PROPOSALS[shop_domain] = proposals
                    logger.info(f"✅ Scheduled analysis: generated {len(proposals)} proposals for {shop_domain}")
                else:
                    logger.warning(f"⚠️ Scheduled analysis: no proposals generated for {shop_domain}")
            except Exception as e:
                logger.error(f"❌ Scheduled analysis error for {shop_domain}: {e}")

        logger.info(f"⏰ Scheduled analysis complete at {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")


def get_scheduled_proposals(store_url: str) -> list | None:
    """Retrieve the latest scheduled proposals for a store, if available."""
    from app.services.shopify_auth import sanitize_shop_domain
    clean = sanitize_shop_domain(store_url)
    return _SCHEDULED_PROPOSALS.get(clean)


def start_scheduler() -> None:
    """Start the background scheduler task."""
    global _scheduler_task
    if _scheduler_task is None or _scheduler_task.done():
        loop = asyncio.get_event_loop()
        _scheduler_task = loop.create_task(_run_scheduled_analysis())
        logger.info("🕐 Background analysis scheduler started (interval: every 6 hours)")


def stop_scheduler() -> None:
    """Cancel the background scheduler task."""
    global _scheduler_task
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("🛑 Background analysis scheduler stopped")
        _scheduler_task = None
