from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Type, Optional, List
from sqlalchemy.orm import Session

T = TypeVar('T')


class IRepository(ABC, Generic[T]):
    @abstractmethod
    def agregar(self, entity: T) -> T: ...

    @abstractmethod
    def obtener(self, entity_id: str) -> Optional[T]: ...

    @abstractmethod
    def obtener_todos(self) -> List[T]: ...

    @abstractmethod
    def actualizar(self, entity: T) -> T: ...


class BaseRepository(IRepository[T]):
    def __init__(self, db: Session, model: Type[T]):
        self._db = db
        self._model = model

    def agregar(self, entity: T) -> T:
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def obtener(self, entity_id: str) -> Optional[T]:
        return self._db.query(self._model).filter(self._model.id == entity_id).first()

    def obtener_todos(self) -> List[T]:
        return self._db.query(self._model).all()

    def actualizar(self, entity: T) -> T:
        self._db.commit()
        self._db.refresh(entity)
        return entity
