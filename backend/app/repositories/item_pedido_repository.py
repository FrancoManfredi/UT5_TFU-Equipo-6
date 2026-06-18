from sqlalchemy.orm import Session
from app.models import ItemPedido
from app.repositories.base_repository import BaseRepository


class ItemPedidoRepository(BaseRepository[ItemPedido]):
    def __init__(self, db: Session):
        super().__init__(db, ItemPedido)
