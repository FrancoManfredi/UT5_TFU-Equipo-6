from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Producto


class ProductoRepository:
    def __init__(self, db: Session):
        self._db = db

    def obtener_todos(self) -> List[Producto]:
        return self._db.query(Producto).all()

    def obtener(self, producto_id: str) -> Optional[Producto]:
        return self._db.query(Producto).filter(Producto.id == producto_id).first()

    def agregar(self, producto: Producto) -> Producto:
        self._db.add(producto)
        self._db.commit()
        self._db.refresh(producto)
        return producto

    def actualizar(self, producto: Producto) -> Producto:
        self._db.commit()
        self._db.refresh(producto)
        return producto

    def actualizar_stock(self, producto_id: str, cantidad: int) -> Optional[Producto]:
        producto = self.obtener(producto_id)
        if producto:
            producto.disponibilidad = max(0, producto.disponibilidad - cantidad)
            self._db.commit()
            self._db.refresh(producto)
        return producto
