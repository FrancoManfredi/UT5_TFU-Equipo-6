import base64
from typing import List
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.notificacion_repository import NotificacionRepository
from app.schemas import NotificacionResponse

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


def _get_cliente_id(x_cliente_id: str = Header(...)) -> str:
    try:
        return base64.b64decode(x_cliente_id.encode()).decode()
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.get("/", response_model=List[NotificacionResponse])
def mis_notificaciones(cliente_id: str = Depends(_get_cliente_id), db: Session = Depends(get_db)):
    return NotificacionRepository(db).obtener_por_cliente(cliente_id)


@router.patch("/{notif_id}/leida", response_model=NotificacionResponse)
def marcar_leida(notif_id: str, cliente_id: str = Depends(_get_cliente_id), db: Session = Depends(get_db)):
    notif = NotificacionRepository(db).marcar_leida(notif_id, cliente_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return notif
