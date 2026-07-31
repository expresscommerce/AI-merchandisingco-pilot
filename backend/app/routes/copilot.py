"""
Copilot router — Handles chat conversations with the AI Merchandising Assistant.
"""

from fastapi import APIRouter, HTTPException

from app.models.copilot import CopilotAskRequest, CopilotAskResponse
from app.services.copilot_service import ask_copilot_assistant

router = APIRouter(prefix="/copilot", tags=["copilot"])


@router.post("/ask", response_model=CopilotAskResponse)
async def ask_copilot(request: CopilotAskRequest) -> CopilotAskResponse:
    """Chat endpoint for AI Merchandising Copilot."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    return await ask_copilot_assistant(request)
