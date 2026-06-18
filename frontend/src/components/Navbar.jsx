import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cliente, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((acc, i) => acc + i.cantidad, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🚚 Truck &amp; Roll</Link>
      <div className="navbar-links">
        {cliente ? (
          <>
            <Link to="/menu">Menú</Link>
            <Link to="/checkout" className="cart-link">
              🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/kitchen">Cocina</Link>
            <span className="navbar-user">👤 {cliente.nombre}</span>
            <button onClick={handleLogout} className="btn-ghost">Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register" className="btn-primary">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
