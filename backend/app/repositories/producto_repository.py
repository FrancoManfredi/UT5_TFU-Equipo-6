from typing import Optional
from sqlalchemy.orm import Session
from app.models import Producto
from app.repositories.base_repository import BaseRepository


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, db: Session):
        super().__init__(db, Producto)

    def actualizar_stock(self, producto_id: str, cantidad: int) -> Optional[Producto]:
        producto = self.obtener(producto_id)
        if producto:
            producto.disponibilidad = max(0, producto.disponibilidad - cantidad)
            self._db.commit()
            self._db.refresh(producto)
        return producto
