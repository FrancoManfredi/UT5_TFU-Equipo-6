from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Pedido, EstadoPedido
from app.repositories.base_repository import BaseRepository


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, db: Session):
        super().__init__(db, Pedido)

    def actualizar_estado(self, pedido_id: str, nuevo_estado: str) -> Optional[Pedido]:
        pedido = self.obtener(pedido_id)
        if pedido:
            pedido.estado = nuevo_estado
            self._db.commit()
            self._db.refresh(pedido)
        return pedido

    def obtener_pedidos_activos(self) -> List[Pedido]:
        estados_activos = [EstadoPedido.PAGADO, EstadoPedido.EN_PREPARACION]
        return (
            self._db.query(Pedido)
            .filter(Pedido.estado.in_(estados_activos))
            .order_by(Pedido.created_at)
            .all()
        )

    def confirmar_pedido(self, pedido: Pedido) -> Pedido:
        self._db.commit()
        self._db.refresh(pedido)
        return pedido
