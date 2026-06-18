from typing import Optional
from sqlalchemy.orm import Session
from app.models import Cliente
from app.repositories.base_repository import BaseRepository


class ClienteRepository(BaseRepository[Cliente]):
    def __init__(self, db: Session):
        super().__init__(db, Cliente)

    def verificar_credenciales(self, email: str) -> Optional[Cliente]:
        return self._db.query(Cliente).filter(Cliente.email == email).first()

    def email_existe(self, email: str) -> bool:
        return self._db.query(Cliente).filter(Cliente.email == email).first() is not None
