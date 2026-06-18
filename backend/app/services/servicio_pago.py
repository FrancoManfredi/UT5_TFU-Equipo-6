"""
Patrón Strategy para métodos de pago.
Agregar un nuevo método = crear una clase que extienda PaymentStrategy.
(Open/Closed Principle)
"""
from abc import ABC, abstractmethod
from typing import Optional
from app.models import MetodoPago


class PaymentStrategy(ABC):
    @abstractmethod
    def procesar(self, monto: float, datos_externos: Optional[dict]) -> dict:
        pass


class EfectivoStrategy(PaymentStrategy):
    def procesar(self, monto: float, datos_externos: Optional[dict]) -> dict:
        return {"estado": "COMPLETADO", "referencia": "EFECTIVO", "monto": monto}


class TarjetaStrategy(PaymentStrategy):
    def procesar(self, monto: float, datos_externos: Optional[dict]) -> dict:
        return {"estado": "COMPLETADO", "referencia": f"TARJETA-{id(datos_externos)}", "monto": monto}


class MercadoPagoStrategy(PaymentStrategy):
    def procesar(self, monto: float, datos_externos: Optional[dict]) -> dict:
        return {"estado": "COMPLETADO", "referencia": f"MP-{id(datos_externos)}", "monto": monto}


# Factory
_ESTRATEGIAS: dict = {
    MetodoPago.EFECTIVO: EfectivoStrategy(),
    MetodoPago.TARJETA: TarjetaStrategy(),
    MetodoPago.MERCADO_PAGO: MercadoPagoStrategy(),
}


def obtener_estrategia(metodo: MetodoPago) -> PaymentStrategy:
    estrategia = _ESTRATEGIAS.get(metodo)
    if not estrategia:
        raise ValueError(f"Método de pago no soportado: {metodo}")
    return estrategia


class ServicioPago:
    def procesar_transaccion(self, metodo: MetodoPago, monto: float, datos_externos: Optional[dict] = None) -> dict:
        resultado = obtener_estrategia(metodo).procesar(monto, datos_externos)
        if resultado.get("estado") != "COMPLETADO":
            raise ValueError("El pago fue rechazado")
        return resultado
