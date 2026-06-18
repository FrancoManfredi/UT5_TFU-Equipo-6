import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { cliente, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const cartCount = items.reduce((acc, i) => acc + i.cantidad, 0);

  const handleLogout = () => {
    logout();
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <Link to="/" className="navbar-brand" aria-label="Inicio">🚚 Truck &amp; Roll</Link>
      <div className="navbar-links">
        {cliente ? (
          <>
            <Link 
              to="/menu" 
              className={isActive('/menu') ? 'nav-active' : ''}
              aria-current={isActive('/menu') ? 'page' : undefined}
            >
              Menú
            </Link>
            <Link 
              to="/checkout" 
              className={`cart-link ${isActive('/checkout') ? 'nav-active' : ''}`}
              aria-label={`Carrito ${cartCount > 0 ? `(${cartCount} items)` : 'vacío'}`}
            >
              🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link 
              to="/kitchen" 
              className={isActive('/kitchen') ? 'nav-active' : ''}
              aria-current={isActive('/kitchen') ? 'page' : undefined}
            >
              Cocina
            </Link>
            <span className="navbar-user" aria-label="Usuario actual">👤 {cliente.nombre}</span>
            <button onClick={handleLogout} className="btn-ghost" aria-label="Cerrar sesión">Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login') ? 'nav-active' : ''}>Iniciar sesión</Link>
            <Link to="/register" className="btn-primary">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
