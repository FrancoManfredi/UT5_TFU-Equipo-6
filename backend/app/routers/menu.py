from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Producto
from app.repositories.producto_repository import ProductoRepository
from app.schemas import ProductoCreate, ProductoUpdate, ProductoResponse

router = APIRouter(prefix="/menu", tags=["Menú"])


@router.get("/", response_model=List[ProductoResponse])
def ver_menu(db: Session = Depends(get_db)):
    return ProductoRepository(db).obtener_todos()


@router.get("/{producto_id}", response_model=ProductoResponse)
def ver_producto(producto_id: str, db: Session = Depends(get_db)):
    p = ProductoRepository(db).obtener(producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p


@router.post("/", response_model=ProductoResponse, status_code=201)
def agregar_producto(body: ProductoCreate, db: Session = Depends(get_db)):
    return ProductoRepository(db).agregar(Producto(**body.model_dump()))


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: str, body: ProductoUpdate, db: Session = Depends(get_db)):
    repo = ProductoRepository(db)
    p = repo.obtener(producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for campo, valor in body.model_dump(exclude_none=True).items():
        setattr(p, campo, valor)
    return repo.actualizar(p)


@router.patch("/{producto_id}/stock", response_model=ProductoResponse)
def set_stock(producto_id: str, cantidad: int, db: Session = Depends(get_db)):
    repo = ProductoRepository(db)
    p = repo.obtener(producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p.disponibilidad = cantidad
    return repo.actualizar(p)
