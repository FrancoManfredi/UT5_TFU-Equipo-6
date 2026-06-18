"""
Patrón Observer: se invoca cuando el estado del pedido cambia a LISTO.
En producción reemplazar el print por FCM / WebSocket / SMS.
"""
from app.models import Cliente, Notificacion
from app.repositories.pedido_repository import PedidoRepository


class ServicioNotificaciones:
    def __init__(self, pedido_repo: PedidoRepository):
        self._pedido_repo = pedido_repo

    def enviar_notificacion(self, cliente: Cliente, mensaje: str) -> Notificacion:
        notif = Notificacion(cliente_id=cliente.id, mensaje=mensaje)
        guardada = self._pedido_repo.agregar_notificacion(notif)
        print(f"[NOTIF → {cliente.email}]: {mensaje}")
        return guardada
