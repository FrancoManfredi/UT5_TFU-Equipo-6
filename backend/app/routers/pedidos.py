import base64
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PedidoCreate, PedidoResponse, PagoRequest, PagoResponse
from app.services.servicio_pedido import ServicioPedido
from app.utils.response_builder import build_pedido_response

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def _get_cliente_id(x_cliente_id: str = Header(...)) -> str:
    try:
        return base64.b64decode(x_cliente_id.encode()).decode()
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/", response_model=PedidoResponse, status_code=201)
def crear_pedido(body: PedidoCreate, cliente_id: str = Depends(_get_cliente_id), db: Session = Depends(get_db)):
    pedido = ServicioPedido(db).confirmar_pedido(cliente_id, body.items)
    return build_pedido_response(pedido)


@router.get("/{pedido_id}", response_model=PedidoResponse)
def consultar_pedido(pedido_id: str, cliente_id: str = Depends(_get_cliente_id), db: Session = Depends(get_db)):
    servicio = ServicioPedido(db)
    pedido = servicio.obtener_pedido(pedido_id)
    if pedido.cliente_id != cliente_id:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return build_pedido_response(pedido)


@router.post("/{pedido_id}/pagar", response_model=PagoResponse)
def pagar_pedido(pedido_id: str, body: PagoRequest, cliente_id: str = Depends(_get_cliente_id), db: Session = Depends(get_db)):
    servicio = ServicioPedido(db)
    pedido = servicio.obtener_pedido(pedido_id)
    if pedido.cliente_id != cliente_id:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return servicio.remitir_pedido(pedido_id, body)
