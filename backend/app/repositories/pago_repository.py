from sqlalchemy.orm import Session
from app.models import Pago
from app.repositories.base_repository import BaseRepository


class PagoRepository(BaseRepository[Pago]):
    def __init__(self, db: Session):
        super().__init__(db, Pago)

    def registrar_pago(self, pago: Pago) -> Pago:
        return self.agregar(pago)
