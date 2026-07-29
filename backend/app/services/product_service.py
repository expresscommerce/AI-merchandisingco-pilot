"""
Product service — business logic for product operations.

Uses an in-memory store for now; swap with a real DB repository later.
"""

from datetime import datetime
from uuid import UUID, uuid4

from app.models.product import ProductCreate, ProductResponse, ProductUpdate


class ProductService:
    """In-memory product CRUD (placeholder until DB is wired)."""

    def __init__(self) -> None:
        self._store: dict[UUID, ProductResponse] = {}

    # ── Queries ──────────────────────────────────────────────────────────

    def list_all(self) -> list[ProductResponse]:
        return list(self._store.values())

    def get_by_id(self, product_id: UUID) -> ProductResponse | None:
        return self._store.get(product_id)

    # ── Commands ─────────────────────────────────────────────────────────

    def create(self, payload: ProductCreate) -> ProductResponse:
        now = datetime.utcnow()
        product = ProductResponse(
            id=uuid4(),
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        self._store[product.id] = product
        return product

    def update(self, product_id: UUID, payload: ProductUpdate) -> ProductResponse | None:
        existing = self._store.get(product_id)
        if not existing:
            return None
        updated_data = existing.model_dump()
        updated_data.update(payload.model_dump(exclude_unset=True))
        updated_data["updated_at"] = datetime.utcnow()
        updated = ProductResponse(**updated_data)
        self._store[product_id] = updated
        return updated

    def delete(self, product_id: UUID) -> bool:
        return self._store.pop(product_id, None) is not None
