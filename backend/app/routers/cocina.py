from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PedidoResponse, EstadoUpdate, ItemPedidoResponse
from app.services.servicio_pedido import ServicioPedido

router = APIRouter(prefix="/cocina", tags=["Cocina"])


def _build_response(pedido) -> PedidoResponse:
    return PedidoResponse(
        id=pedido.id,
        numero_pedido=pedido.numero_pedido,
        estado=pedido.estado,
        monto_total=pedido.monto_total,
        cliente_id=pedido.cliente_id,
        created_at=pedido.created_at,
        items=[ItemPedidoResponse.from_orm_item(i) for i in pedido.items],
    )


@router.get("/pedidos", response_model=List[PedidoResponse])
def ver_pedidos_activos(db: Session = Depends(get_db)):
    return [_build_response(p) for p in ServicioPedido(db).obtener_pedidos_activos()]


@router.patch("/pedidos/{pedido_id}/estado", response_model=PedidoResponse)
def actualizar_estado(pedido_id: str, body: EstadoUpdate, db: Session = Depends(get_db)):
    pedido = ServicioPedido(db).actualizar_estado(pedido_id, body.estado)
    return _build_response(pedido)
