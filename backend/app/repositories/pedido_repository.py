from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Pedido, ItemPedido, Pago, Notificacion, EstadoPedido


class PedidoRepository:
    def __init__(self, db: Session):
        self._db = db

    def agregar(self, pedido: Pedido) -> Pedido:
        self._db.add(pedido)
        self._db.commit()
        self._db.refresh(pedido)
        return pedido

    def obtener(self, pedido_id: str) -> Optional[Pedido]:
        return self._db.query(Pedido).filter(Pedido.id == pedido_id).first()

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

    def iniciar_pedido_activo(self, pedido: Pedido) -> Pedido:
        self._db.commit()
        self._db.refresh(pedido)
        return pedido

    def agregar_item(self, item: ItemPedido) -> ItemPedido:
        self._db.add(item)
        self._db.commit()
        self._db.refresh(item)
        return item

    def registrar_pago(self, pago: Pago) -> Pago:
        self._db.add(pago)
        self._db.commit()
        self._db.refresh(pago)
        return pago

    def agregar_notificacion(self, notif: Notificacion) -> Notificacion:
        self._db.add(notif)
        self._db.commit()
        self._db.refresh(notif)
        return notif

    def obtener_notificaciones(self, cliente_id: str) -> List[Notificacion]:
        return (
            self._db.query(Notificacion)
            .filter(Notificacion.cliente_id == cliente_id)
            .order_by(Notificacion.timestamp.desc())
            .all()
        )

    def marcar_leida(self, notif_id: str, cliente_id: str) -> Optional[Notificacion]:
        notif = (
            self._db.query(Notificacion)
            .filter(Notificacion.id == notif_id, Notificacion.cliente_id == cliente_id)
            .first()
        )
        if notif:
            notif.leida = True
            self._db.commit()
            self._db.refresh(notif)
        return notif
