from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator

from app.models import EstadoPedido, MetodoPago


# ── Auth ───────────────────────────────────────────────────────────────────────

class ClienteRegistro(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    password: str


class ClienteLogin(BaseModel):
    email: EmailStr
    password: str


class ClienteResponse(BaseModel):
    id: str
    nombre: str
    email: str
    telefono: Optional[str] = None
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    cliente: ClienteResponse


# ── Producto ───────────────────────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    disponibilidad: int = 0
    categoria: Optional[str] = "General"

    @field_validator("precio")
    @classmethod
    def precio_positivo(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        return v


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    disponibilidad: Optional[int] = None
    categoria: Optional[str] = None


class ProductoResponse(BaseModel):
    id: str
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    disponibilidad: int
    categoria: Optional[str] = None
    model_config = {"from_attributes": True}


# ── Pedido ─────────────────────────────────────────────────────────────────────

class ItemPedidoCreate(BaseModel):
    producto_id: str
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("La cantidad debe ser mayor a 0")
        return v


class ItemPedidoResponse(BaseModel):
    id: str
    producto_id: str
    cantidad: int
    precio_unitario: float
    subtotal: float = 0.0
    nombre_producto: Optional[str] = None
    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_item(cls, item) -> "ItemPedidoResponse":
        return cls(
            id=item.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            subtotal=item.cantidad * item.precio_unitario,
            nombre_producto=item.producto.nombre if item.producto else None,
        )


class PedidoCreate(BaseModel):
    items: List[ItemPedidoCreate]


class PedidoResponse(BaseModel):
    id: str
    numero_pedido: str
    estado: str
    monto_total: float
    cliente_id: str
    created_at: datetime
    items: List[ItemPedidoResponse] = []
    model_config = {"from_attributes": True}


class EstadoUpdate(BaseModel):
    estado: EstadoPedido


# ── Pago ───────────────────────────────────────────────────────────────────────

class PagoRequest(BaseModel):
    metodo_pago: MetodoPago
    datos_externos: Optional[dict] = None


class PagoResponse(BaseModel):
    id: str
    pedido_id: str
    monto: float
    metodo_pago: str
    estado: str
    timestamp: datetime
    model_config = {"from_attributes": True}


# ── Notificación ───────────────────────────────────────────────────────────────

class NotificacionResponse(BaseModel):
    id: str
    mensaje: str
    timestamp: datetime
    leida: bool
    model_config = {"from_attributes": True}
