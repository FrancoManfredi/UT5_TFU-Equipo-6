import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, menu, pedidos, cocina, notificaciones

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Truck & Roll API",
    description="Sistema de pedidos para food truck – ADA1 UT5 Grupo 06",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(pedidos.router)
app.include_router(cocina.router)
app.include_router(notificaciones.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Truck & Roll API"}
