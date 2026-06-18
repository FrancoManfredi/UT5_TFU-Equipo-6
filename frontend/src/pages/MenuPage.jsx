import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const CATEGORIAS = ['Todo', 'Burgers', 'Bebidas', 'Extras'];

export default function MenuPage() {
  const { cliente } = useAuth();
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cliente) { navigate('/login'); return; }
    api.get('/menu/')
      .then((r) => setProductos(r.data))
      .catch(() => setError('No se pudo cargar el menú'))
      .finally(() => setLoading(false));
  }, [cliente, navigate]);

  const filtrados = categoriaActiva === 'Todo'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

  const cartCount = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <div className="page">
      <div className="menu-header">
        <h1>Nuestro Menú</h1>
        <div className="category-tabs">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={`tab ${categoriaActiva === c ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {loading && <p className="info-msg">Cargando menú…</p>}
      {error && <p className="error-msg">{error}</p>}

      <div className="product-grid">
        {filtrados.map((p) => <ProductCard key={p.id} producto={p} />)}
      </div>

      {cartCount > 0 && (
        <div className="floating-cart" onClick={() => navigate('/checkout')}>
          🛒 {cartCount} {cartCount === 1 ? 'item' : 'items'} · ${total.toFixed(2)}
          <span className="cart-arrow"> →</span>
        </div>
      )}
    </div>
  );
}
