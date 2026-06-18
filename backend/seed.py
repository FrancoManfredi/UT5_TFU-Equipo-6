"""
Ejecutar UNA VEZ para poblar el catálogo de productos.
    python3 seed.py
"""
import uuid
from app.database import SessionLocal, engine, Base
from app.models import Producto

Base.metadata.create_all(bind=engine)

PRODUCTOS = [
    # Burgers
    {"nombre": "Burger Clásica",    "descripcion": "Medallón de res 150g, lechuga, tomate y cheddar",              "precio": 450, "disponibilidad": 20, "categoria": "Burgers"},
    {"nombre": "Double Smash",      "descripcion": "Doble medallón aplastado, salsa secreta y pickles",             "precio": 620, "disponibilidad": 15, "categoria": "Burgers"},
    {"nombre": "Chicken Crispy",    "descripcion": "Pollo crocante con coleslaw y mayonesa de chipotle",            "precio": 530, "disponibilidad": 15, "categoria": "Burgers"},
    {"nombre": "Veggie Burger",     "descripcion": "Medallón de lentejas y garbanzos, aguacate y rúcula",           "precio": 480, "disponibilidad": 10, "categoria": "Burgers"},
    # Bebidas
    {"nombre": "Coca-Cola",         "descripcion": "Lata 354ml",                                                    "precio": 180, "disponibilidad": 50, "categoria": "Bebidas"},
    {"nombre": "Agua Mineral",      "descripcion": "Botella 500ml sin gas",                                         "precio": 120, "disponibilidad": 50, "categoria": "Bebidas"},
    {"nombre": "Limonada Natural",  "descripcion": "Limonada casera con menta, 400ml",                              "precio": 220, "disponibilidad": 30, "categoria": "Bebidas"},
    {"nombre": "Milkshake Vainilla","descripcion": "Batido artesanal de vainilla con crema",                        "precio": 320, "disponibilidad": 20, "categoria": "Bebidas"},
    # Extras
    {"nombre": "Papas Fritas",      "descripcion": "Porción grande con sal y pimienta, salsa a elección",           "precio": 280, "disponibilidad": 30, "categoria": "Extras"},
    {"nombre": "Aros de Cebolla",   "descripcion": "Aros crocantes con aderezo ranch",                              "precio": 260, "disponibilidad": 25, "categoria": "Extras"},
    {"nombre": "Nuggets x6",        "descripcion": "Nuggets de pollo caseros con salsa BBQ",                        "precio": 300, "disponibilidad": 20, "categoria": "Extras"},
    {"nombre": "Porción de Queso",  "descripcion": "Cheddar fundido extra para agregar a tu burger",                "precio":  80, "disponibilidad": 40, "categoria": "Extras"},
]

db = SessionLocal()
try:
    existing = db.query(Producto).count()
    if existing > 0:
        print(f"Ya hay {existing} productos en la base de datos. Seed omitido.")
    else:
        for p in PRODUCTOS:
            db.add(Producto(id=str(uuid.uuid4()), **p))
        db.commit()
        print(f"✅ {len(PRODUCTOS)} productos agregados correctamente.")
finally:
    db.close()
