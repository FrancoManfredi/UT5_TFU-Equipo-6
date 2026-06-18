from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Notificacion
from app.repositories.base_repository import BaseRepository


class NotificacionRepository(BaseRepository[Notificacion]):
    def __init__(self, db: Session):
        super().__init__(db, Notificacion)

    def obtener_por_cliente(self, cliente_id: str) -> List[Notificacion]:
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
