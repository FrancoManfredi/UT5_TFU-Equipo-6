from abc import ABC, abstractmethod
from typing import List, Optional
from app.models import EstadoPedido


class EstadoPedidoState(ABC):
    @abstractmethod
    def get_estado(self) -> EstadoPedido: ...

    @abstractmethod
    def transiciones_permitidas(self) -> List[EstadoPedido]: ...

    @abstractmethod
    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool: ...

    @abstractmethod
    def get_nombre(self) -> str: ...


class PendienteState(EstadoPedidoState):
    def get_estado(self) -> EstadoPedido:
        return EstadoPedido.PENDIENTE

    def transiciones_permitidas(self) -> List[EstadoPedido]:
        return [EstadoPedido.PAGADO]

    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool:
        return nuevo_estado in self.transiciones_permitidas()

    def get_nombre(self) -> str:
        return "Pendiente"


class PagadoState(EstadoPedidoState):
    def get_estado(self) -> EstadoPedido:
        return EstadoPedido.PAGADO

    def transiciones_permitidas(self) -> List[EstadoPedido]:
        return [EstadoPedido.EN_PREPARACION]

    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool:
        return nuevo_estado in self.transiciones_permitidas()

    def get_nombre(self) -> str:
        return "Pagado"


class EnPreparacionState(EstadoPedidoState):
    def get_estado(self) -> EstadoPedido:
        return EstadoPedido.EN_PREPARACION

    def transiciones_permitidas(self) -> List[EstadoPedido]:
        return [EstadoPedido.LISTO]

    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool:
        return nuevo_estado in self.transiciones_permitidas()

    def get_nombre(self) -> str:
        return "En preparación"


class ListoState(EstadoPedidoState):
    def get_estado(self) -> EstadoPedido:
        return EstadoPedido.LISTO

    def transiciones_permitidas(self) -> List[EstadoPedido]:
        return [EstadoPedido.ENTREGADO]

    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool:
        return nuevo_estado in self.transiciones_permitidas()

    def get_nombre(self) -> str:
        return "Listo"


class EntregadoState(EstadoPedidoState):
    def get_estado(self) -> EstadoPedido:
        return EstadoPedido.ENTREGADO

    def transiciones_permitidas(self) -> List[EstadoPedido]:
        return []

    def puede_transicionar_a(self, nuevo_estado: EstadoPedido) -> bool:
        return False

    def get_nombre(self) -> str:
        return "Entregado"


class EstadoPedidoFactory:
    _ESTADOS = {
        EstadoPedido.PENDIENTE: PendienteState,
        EstadoPedido.PAGADO: PagadoState,
        EstadoPedido.EN_PREPARACION: EnPreparacionState,
        EstadoPedido.LISTO: ListoState,
        EstadoPedido.ENTREGADO: EntregadoState,
    }

    @classmethod
    def crear(cls, estado: EstadoPedido) -> EstadoPedidoState:
        estado_class = cls._ESTADOS.get(estado)
        if not estado_class:
            raise ValueError(f"Estado desconocido: {estado}")
        return estado_class()
