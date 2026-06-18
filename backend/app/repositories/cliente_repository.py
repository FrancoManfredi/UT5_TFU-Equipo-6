from typing import Optional
from sqlalchemy.orm import Session
from app.models import Cliente


class ClienteRepository:
    def __init__(self, db: Session):
        self._db = db

    def agregar(self, cliente: Cliente) -> Cliente:
        self._db.add(cliente)
        self._db.commit()
        self._db.refresh(cliente)
        return cliente

    def obtener(self, cliente_id: str) -> Optional[Cliente]:
        return self._db.query(Cliente).filter(Cliente.id == cliente_id).first()

    def verificar_credenciales(self, email: str) -> Optional[Cliente]:
        return self._db.query(Cliente).filter(Cliente.email == email).first()

    def email_existe(self, email: str) -> bool:
        return self._db.query(Cliente).filter(Cliente.email == email).first() is not None
