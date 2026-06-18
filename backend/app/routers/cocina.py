from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PedidoResponse, EstadoUpdate
from app.services.servicio_pedido import ServicioPedido
from app.utils.response_builder import build_pedido_response

router = APIRouter(prefix="/cocina", tags=["Cocina"])


@router.get("/pedidos", response_model=List[PedidoResponse])
def ver_pedidos_activos(db: Session = Depends(get_db)):
    return [build_pedido_response(p) for p in ServicioPedido(db).obtener_pedidos_activos()]


@router.patch("/pedidos/{pedido_id}/estado", response_model=PedidoResponse)
def actualizar_estado(pedido_id: str, body: EstadoUpdate, db: Session = Depends(get_db)):
    pedido = ServicioPedido(db).actualizar_estado(pedido_id, body.estado)
    return build_pedido_response(pedido)
