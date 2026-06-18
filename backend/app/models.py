"""
Modelos de dominio – Truck & Roll
Extraídos del diagrama de clases UML (UT3).
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class EstadoPedido(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    PAGADO = "PAGADO"
    EN_PREPARACION = "EN_PREPARACION"
    LISTO = "LISTO"
    ENTREGADO = "ENTREGADO"


class MetodoPago(str, enum.Enum):
    EFECTIVO = "EFECTIVO"
    TARJETA = "TARJETA"
    MERCADO_PAGO = "MERCADO_PAGO"


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    telefono = Column(String)
    password_hash = Column(String, nullable=False)

    pedidos = relationship("Pedido", back_populates="cliente")
    notificaciones = relationship("Notificacion", back_populates="cliente")


class Producto(Base):
    __tablename__ = "productos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    disponibilidad = Column(Integer, default=0)
    categoria = Column(String, default="General")

    items = relationship("ItemPedido", back_populates="producto")


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    numero_pedido = Column(String, unique=True, index=True)
    estado = Column(String, default=EstadoPedido.PENDIENTE)
    monto_total = Column(Float, default=0.0)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="pedidos")
    items = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")
    pago = relationship("Pago", back_populates="pedido", uselist=False)


class ItemPedido(Base):
    __tablename__ = "items_pedido"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pedido_id = Column(String, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(String, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)

    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="items")


class Pago(Base):
    __tablename__ = "pagos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pedido_id = Column(String, ForeignKey("pedidos.id"), unique=True)
    monto = Column(Float, nullable=False)
    metodo_pago = Column(String, nullable=False)
    estado = Column(String, default="COMPLETADO")
    timestamp = Column(DateTime, default=datetime.utcnow)

    pedido = relationship("Pedido", back_populates="pago")


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_id = Column(String, ForeignKey("clientes.id"))
    mensaje = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    leida = Column(Boolean, default=False)

    cliente = relationship("Cliente", back_populates="notificaciones")
