"""
Product CRUD routes.
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

service = ProductService()


@router.get("/", response_model=list[ProductResponse], summary="List products")
async def list_products():
    return service.list_all()


@router.get("/{product_id}", response_model=ProductResponse, summary="Get product")
async def get_product(product_id: UUID):
    product = service.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=201, summary="Create product")
async def create_product(payload: ProductCreate):
    return service.create(payload)


@router.patch("/{product_id}", response_model=ProductResponse, summary="Update product")
async def update_product(product_id: UUID, payload: ProductUpdate):
    product = service.update(product_id, payload)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=204, summary="Delete product")
async def delete_product(product_id: UUID):
    if not service.delete(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
