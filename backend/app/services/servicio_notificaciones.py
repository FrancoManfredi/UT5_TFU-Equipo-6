import logging
from sqlalchemy.orm import Session
from app.models import Cliente, Notificacion
from app.repositories.notificacion_repository import NotificacionRepository
from app.events.event_emitter import event_emitter

logger = logging.getLogger(__name__)


class ServicioNotificaciones:
    def __init__(self, db: Session):
        self._notif_repo = NotificacionRepository(db)
        self._setup_event_listeners()

    def _setup_event_listeners(self):
        event_emitter.on("pedido.listo", self._on_pedido_listo)

    def _on_pedido_listo(self, data: dict):
        logger.info(f"[EVENT] Pedido listo: {data.get('numero_pedido')}")

    def enviar_notificacion(self, cliente: Cliente, mensaje: str) -> Notificacion:
        notif = Notificacion(cliente_id=cliente.id, mensaje=mensaje)
        guardada = self._notif_repo.agregar(notif)
        logger.info(f"[NOTIF → {cliente.email}]: {mensaje}")
        event_emitter.emit("notificacion.enviada", {
            "cliente_id": cliente.id,
            "mensaje": mensaje,
        })
        return guardada
