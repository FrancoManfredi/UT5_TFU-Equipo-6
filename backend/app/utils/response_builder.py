from app.models import Pedido
from app.schemas import PedidoResponse, ItemPedidoResponse


def build_pedido_response(pedido: Pedido) -> PedidoResponse:
    return PedidoResponse(
        id=pedido.id,
        numero_pedido=pedido.numero_pedido,
        estado=pedido.estado,
        monto_total=pedido.monto_total,
        cliente_id=pedido.cliente_id,
        created_at=pedido.created_at,
        items=[ItemPedidoResponse.from_orm_item(i) for i in pedido.items],
    )
