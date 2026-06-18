"""
Ejecutar UNA VEZ para poblar la base de datos completa.
    python seed.py
"""
import uuid
import hashlib
from datetime import datetime

from app.database import SessionLocal, engine, Base
from app.models import Cliente, Producto, Pedido, ItemPedido, Pago, Notificacion, EstadoPedido, MetodoPago

Base.metadata.create_all(bind=engine)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


PRODUCTOS = [
    {"nombre": "Burger Clásica",    "descripcion": "Medallón de res 150g, lechuga, tomate y cheddar",              "precio": 450, "disponibilidad": 20, "categoria": "Burgers"},
    {"nombre": "Double Smash",      "descripcion": "Doble medallón aplastado, salsa secreta y pickles",             "precio": 620, "disponibilidad": 15, "categoria": "Burgers"},
    {"nombre": "Chicken Crispy",    "descripcion": "Pollo crocante con coleslaw y mayonesa de chipotle",            "precio": 530, "disponibilidad": 15, "categoria": "Burgers"},
    {"nombre": "Veggie Burger",     "descripcion": "Medallón de lentejas y garbanzos, aguacate y rúcula",           "precio": 480, "disponibilidad": 10, "categoria": "Burgers"},
    {"nombre": "Coca-Cola",         "descripcion": "Lata 354ml",                                                    "precio": 180, "disponibilidad": 50, "categoria": "Bebidas"},
    {"nombre": "Agua Mineral",      "descripcion": "Botella 500ml sin gas",                                         "precio": 120, "disponibilidad": 50, "categoria": "Bebidas"},
    {"nombre": "Limonada Natural",  "descripcion": "Limonada casera con menta, 400ml",                              "precio": 220, "disponibilidad": 30, "categoria": "Bebidas"},
    {"nombre": "Milkshake Vainilla","descripcion": "Batido artesanal de vainilla con crema",                        "precio": 320, "disponibilidad": 20, "categoria": "Bebidas"},
    {"nombre": "Papas Fritas",      "descripcion": "Porción grande con sal y pimienta, salsa a elección",           "precio": 280, "disponibilidad": 30, "categoria": "Extras"},
    {"nombre": "Aros de Cebolla",   "descripcion": "Aros crocantes con aderezo ranch",                              "precio": 260, "disponibilidad": 25, "categoria": "Extras"},
    {"nombre": "Nuggets x6",        "descripcion": "Nuggets de pollo caseros con salsa BBQ",                        "precio": 300, "disponibilidad": 20, "categoria": "Extras"},
    {"nombre": "Porción de Queso",  "descripcion": "Cheddar fundido extra para agregar a tu burger",                "precio":  80, "disponibilidad": 40, "categoria": "Extras"},
]

CLIENTES = [
    {"nombre": "Juan Pérez",     "email": "juan@email.com",     "telefono": "099111222", "password": "1234"},
    {"nombre": "María García",   "email": "maria@email.com",    "telefono": "099333444", "password": "1234"},
    {"nombre": "Carlos López",   "email": "carlos@email.com",   "telefono": "099555666", "password": "1234"},
]


db = SessionLocal()
try:
    print("Limpiando tablas...")
    db.query(Notificacion).delete()
    db.query(Pago).delete()
    db.query(ItemPedido).delete()
    db.query(Pedido).delete()
    db.query(Producto).delete()
    db.query(Cliente).delete()
    db.commit()

    print("Poblando productos...")
    productos = []
    for p in PRODUCTOS:
        producto = Producto(id=str(uuid.uuid4()), **p)
        db.add(producto)
        productos.append(producto)
    db.flush()

    print("Poblando clientes...")
    clientes = []
    for c in CLIENTES:
        cliente = Cliente(
            id=str(uuid.uuid4()),
            nombre=c["nombre"],
            email=c["email"],
            telefono=c["telefono"],
            password_hash=hash_password(c["password"]),
        )
        db.add(cliente)
        clientes.append(cliente)
    db.flush()

    print("Poblando pedidos de ejemplo...")
    pedido1 = Pedido(
        id=str(uuid.uuid4()),
        numero_pedido="TRK-001",
        estado=EstadoPedido.PENDIENTE,
        monto_total=730.0,
        cliente_id=clientes[0].id,
        created_at=datetime.utcnow(),
    )
    db.add(pedido1)
    db.flush()

    item1 = ItemPedido(
        id=str(uuid.uuid4()),
        pedido_id=pedido1.id,
        producto_id=productos[0].id,
        cantidad=1,
        precio_unitario=productos[0].precio,
    )
    item2 = ItemPedido(
        id=str(uuid.uuid4()),
        pedido_id=pedido1.id,
        producto_id=productos[4].id,
        cantidad=1,
        precio_unitario=productos[4].precio,
    )
    db.add_all([item1, item2])

    pedido2 = Pedido(
        id=str(uuid.uuid4()),
        numero_pedido="TRK-002",
        estado=EstadoPedido.PAGADO,
        monto_total=900.0,
        cliente_id=clientes[1].id,
        created_at=datetime.utcnow(),
    )
    db.add(pedido2)
    db.flush()

    item3 = ItemPedido(
        id=str(uuid.uuid4()),
        pedido_id=pedido2.id,
        producto_id=productos[1].id,
        cantidad=1,
        precio_unitario=productos[1].precio,
    )
    item4 = ItemPedido(
        id=str(uuid.uuid4()),
        pedido_id=pedido2.id,
        producto_id=productos[8].id,
        cantidad=1,
        precio_unitario=productos[8].precio,
    )
    db.add_all([item3, item4])

    pago2 = Pago(
        id=str(uuid.uuid4()),
        pedido_id=pedido2.id,
        monto=900.0,
        metodo_pago=MetodoPago.TARJETA,
        estado="COMPLETADO",
        timestamp=datetime.utcnow(),
    )
    db.add(pago2)

    print("Poblando notificaciones...")
    notif1 = Notificacion(
        id=str(uuid.uuid4()),
        cliente_id=clientes[0].id,
        mensaje="Tu pedido TRK-001 está siendo preparado",
        timestamp=datetime.utcnow(),
        leida=False,
    )
    notif2 = Notificacion(
        id=str(uuid.uuid4()),
        cliente_id=clientes[1].id,
        mensaje="Tu pedido TRK-002 fue confirmado",
        timestamp=datetime.utcnow(),
        leida=True,
    )
    db.add_all([notif1, notif2])

    db.commit()
    print(f"[OK] Base de datos poblada:")
    print(f"   - {len(productos)} productos")
    print(f"   - {len(clientes)} clientes")
    print(f"   - 2 pedidos")
    print(f"   - 2 notificaciones")
    print(f"\nCredenciales de prueba:")
    for c in CLIENTES:
        print(f"   Email: {c['email']} | Password: {c['password']}")
finally:
    db.close()
