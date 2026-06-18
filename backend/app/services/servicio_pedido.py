"""
ServicioPedido – orquesta la lógica de negocio de pedidos.
Aplica SRP, DIP y el patrón Observer para notificaciones.
"""
import uuid
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Pedido, ItemPedido, Pago, EstadoPedido
from app.repositories.pedido_repository import PedidoRepository
from app.repositories.producto_repository import ProductoRepository
from app.repositories.cliente_repository import ClienteRepository
from app.schemas import ItemPedidoCreate, PagoRequest
from app.services.servicio_pago import ServicioPago
from app.services.servicio_notificaciones import ServicioNotificaciones


class ServicioPedido:
    def __init__(self, db: Session):
        self._pedido_repo = PedidoRepository(db)
        self._producto_repo = ProductoRepository(db)
        self._cliente_repo = ClienteRepository(db)
        self._servicio_pago = ServicioPago()
        self._servicio_notif = ServicioNotificaciones(self._pedido_repo)

    def confirmar_pedido(self, cliente_id: str, items: List[ItemPedidoCreate]) -> Pedido:
        if not self._cliente_repo.obtener(cliente_id):
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

        pedido = Pedido(
            cliente_id=cliente_id,
            numero_pedido=f"TK-{str(uuid.uuid4())[:8].upper()}",
            estado=EstadoPedido.PENDIENTE,
        )
        pedido = self._pedido_repo.agregar(pedido)

        monto_total = 0.0
        for item_data in items:
            producto = self._producto_repo.obtener(item_data.producto_id)
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item_data.producto_id} no encontrado")
            if producto.disponibilidad < item_data.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.disponibilidad})",
                )
            self._pedido_repo.agregar_item(ItemPedido(
                pedido_id=pedido.id,
                producto_id=producto.id,
                cantidad=item_data.cantidad,
                precio_unitario=producto.precio,
            ))
            self._producto_repo.actualizar_stock(producto.id, item_data.cantidad)
            monto_total += producto.precio * item_data.cantidad

        pedido.monto_total = monto_total
        return self._pedido_repo.iniciar_pedido_activo(pedido)

    def remitir_pedido(self, pedido_id: str, pago_request: PagoRequest) -> Pago:
        pedido = self._pedido_repo.obtener(pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        if pedido.estado != EstadoPedido.PENDIENTE:
            raise HTTPException(status_code=400, detail=f"Estado inválido para pagar: {pedido.estado}")
        if pedido.pago:
            raise HTTPException(status_code=400, detail="El pedido ya tiene pago registrado")

        resultado = self._servicio_pago.procesar_transaccion(
            metodo=pago_request.metodo_pago,
            monto=pedido.monto_total,
            datos_externos=pago_request.datos_externos,
        )
        pago = self._pedido_repo.registrar_pago(Pago(
            pedido_id=pedido.id,
            monto=pedido.monto_total,
            metodo_pago=pago_request.metodo_pago,
            estado=resultado["estado"],
        ))
        self._pedido_repo.actualizar_estado(pedido.id, EstadoPedido.PAGADO)
        return pago

    def actualizar_estado(self, pedido_id: str, nuevo_estado: EstadoPedido) -> Pedido:
        pedido = self._pedido_repo.obtener(pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        self._validar_transicion(pedido.estado, nuevo_estado)
        pedido = self._pedido_repo.actualizar_estado(pedido.id, nuevo_estado)
        if nuevo_estado == EstadoPedido.LISTO:
            cliente = self._cliente_repo.obtener(pedido.cliente_id)
            if cliente:
                self._servicio_notif.enviar_notificacion(
                    cliente, f"¡Tu pedido #{pedido.numero_pedido} está listo para retirar! 🍔"
                )
        return pedido

    def obtener_pedidos_activos(self) -> List[Pedido]:
        return self._pedido_repo.obtener_pedidos_activos()

    def obtener_pedido(self, pedido_id: str) -> Pedido:
        pedido = self._pedido_repo.obtener(pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return pedido

    _TRANSICIONES = {
        EstadoPedido.PENDIENTE: [EstadoPedido.PAGADO],
        EstadoPedido.PAGADO: [EstadoPedido.EN_PREPARACION],
        EstadoPedido.EN_PREPARACION: [EstadoPedido.LISTO],
        EstadoPedido.LISTO: [EstadoPedido.ENTREGADO],
        EstadoPedido.ENTREGADO: [],
    }

    def _validar_transicion(self, actual: str, nuevo: EstadoPedido) -> None:
        permitidos = self._TRANSICIONES.get(actual, [])
        if nuevo not in permitidos:
            raise HTTPException(
                status_code=400,
                detail=f"Transición inválida: {actual} → {nuevo}. Permitidos: {[e.value for e in permitidos]}",
            )
