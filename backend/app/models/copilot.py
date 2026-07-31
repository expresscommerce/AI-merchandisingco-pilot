"""
Pydantic models for the AI Copilot Assistant feature.
"""

from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


class CopilotMessage(BaseModel):
    """Single chat message in conversation history."""
    role: Literal["user", "assistant"]
    content: str


class CopilotAskRequest(BaseModel):
    """Payload for POST /api/copilot/ask."""
    message: str = Field(..., description="User's question or command")
    conversation_history: list[CopilotMessage] = Field(
        default_factory=list,
        description="Previous conversation messages (capped at ~10 by client/server)",
    )
    store_url: str | None = Field(default=None, description="Active merchant store domain")
    category: str | None = Field(default="Home & Kitchen", description="Current selected category")


class CopilotAskResponse(BaseModel):
    """Response returned by POST /api/copilot/ask."""
    reply: str = Field(..., description="Grounded AI response text")
    suggested_proposal: dict[str, Any] | None = Field(
        default=None,
        description="Optional structured proposal payload if the AI generated a concrete recommendation",
    )
