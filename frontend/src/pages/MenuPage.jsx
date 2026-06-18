import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useSearch } from '../hooks/useSearch';
import ProductCard from '../components/ProductCard';

const CATEGORIAS = ['Todo', 'Burgers', 'Bebidas', 'Extras'];

export default function MenuPage() {
  const { cliente } = useAuth();
  const { items, total } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cliente) { navigate('/login'); return; }
    api.get('/menu/')
      .then((r) => setProductos(r.data))
      .catch(() => {
        setError('No se pudo cargar el menú');
        toast.error('Error al cargar el menú. Intentá de nuevo.');
      })
      .finally(() => setLoading(false));
  }, [cliente, navigate]);

  const productosFiltradosPorCategoria = useMemo(() => {
    if (categoriaActiva === 'Todo') return productos;
    return productos.filter((p) => p.categoria === categoriaActiva);
  }, [productos, categoriaActiva]);

  const { busqueda, setBusqueda, filteredItems, clearSearch, hasResults, resultsCount } = useSearch(
    productosFiltradosPorCategoria,
    ['nombre', 'descripcion']
  );

  const cartCount = items.reduce((acc, i) => acc + i.cantidad, 0);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    api.get('/menu/')
      .then((r) => setProductos(r.data))
      .catch(() => setError('No se pudo cargar el menú'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item">Inicio</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Menú</span>
      </nav>

      <div className="menu-header">
        <h1>Nuestro Menú</h1>

        <div className="menu-search">
          <input
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
            aria-label="Buscar productos"
          />
          {busqueda && (
            <button
              className="search-clear"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="category-tabs" role="tablist">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={categoriaActiva === c}
              className={`tab ${categoriaActiva === c ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-skeleton">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
          <p className="info-msg">Cargando menú…</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p className="error-msg">{error}</p>
          <button className="btn-primary" onClick={handleRetry}>Reintentar</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {busqueda && (
            <p className="search-results">
              {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
              {busqueda && <span> para "{busqueda}"</span>}
            </p>
          )}

          {!hasResults ? (
            <div className="empty-state">
              {busqueda ? (
                <>
                  <p className="empty-icon">🔍</p>
                  <p>No encontramos productos con "{busqueda}"</p>
                  <button className="btn-ghost" onClick={clearSearch}>Limpiar búsqueda</button>
                </>
              ) : (
                <>
                  <p className="empty-icon">📦</p>
                  <p>No hay productos en esta categoría</p>
                  <button className="btn-ghost" onClick={() => setCategoriaActiva('Todo')}>Ver todos</button>
                </>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredItems.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}
        </>
      )}

      {cartCount > 0 && (
        <div className="floating-cart" onClick={() => navigate('/checkout')} role="button" tabIndex={0}>
          🛒 {cartCount} {cartCount === 1 ? 'item' : 'items'} · ${total.toFixed(2)}
          <span className="cart-arrow"> →</span>
        </div>
      )}
    </div>
  );
}
