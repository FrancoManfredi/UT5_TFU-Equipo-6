import hashlib, base64
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cliente
from app.repositories.cliente_repository import ClienteRepository
from app.schemas import ClienteRegistro, ClienteLogin, ClienteResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("/register", response_model=ClienteResponse, status_code=201)
def registrar(body: ClienteRegistro, db: Session = Depends(get_db)):
    repo = ClienteRepository(db)
    if repo.email_existe(body.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    return repo.agregar(Cliente(
        nombre=body.nombre,
        email=body.email,
        telefono=body.telefono,
        password_hash=_hash(body.password),
    ))


@router.post("/login", response_model=TokenResponse)
def login(body: ClienteLogin, db: Session = Depends(get_db)):
    repo = ClienteRepository(db)
    cliente = repo.verificar_credenciales(body.email)
    if not cliente or _hash(body.password) != cliente.password_hash:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = base64.b64encode(cliente.id.encode()).decode()
    return TokenResponse(access_token=token, cliente=ClienteResponse.model_validate(cliente))
