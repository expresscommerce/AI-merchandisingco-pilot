"""
Product domain models (Pydantic schemas).
"""

from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ── Request / Response schemas ──────────────────────────────────────────


class ProductBase(BaseModel):
    """Shared product fields."""

    name: str = Field(..., min_length=1, max_length=255, examples=["Organic Almonds 1 lb"])
    sku: str = Field(..., min_length=1, max_length=64, examples=["ALM-ORG-001"])
    category: str | None = Field(default=None, examples=["Nuts & Seeds"])
    price: float = Field(..., gt=0, examples=[12.99])
    description: str | None = None


class ProductCreate(ProductBase):
    """Payload for creating a product."""

    pass


class ProductUpdate(BaseModel):
    """Payload for partial product updates."""

    name: str | None = None
    sku: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, gt=0)
    description: str | None = None


class ProductResponse(ProductBase):
    """Product returned from the API."""

    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"from_attributes": True}
