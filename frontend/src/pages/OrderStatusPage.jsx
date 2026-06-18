import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  EN_PREPARACION: 'En preparación',
  LISTO: '¡Listo para retirar!',
  ENTREGADO: 'Entregado',
};

const ESTADO_ICONS = {
  PENDIENTE: '⏳',
  PAGADO: '✅',
  EN_PREPARACION: '👨‍🍳',
  LISTO: '🎉',
  ENTREGADO: '🏁',
};

const ESTADO_TIEMPO = {
  PENDIENTE: 'Confirmando...',
  PAGADO: '5-10 min',
  EN_PREPARACION: '10-15 min',
  LISTO: '¡Ya está listo!',
  ENTREGADO: 'Finalizado',
};

const ESTADO_ORDER = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];

export default function OrderStatusPage() {
  const { id } = useParams();
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [pedido, setPedido] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchPedido = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const { data } = await api.get(`/pedidos/${id}`);
      setPedido(data);
      setLastUpdate(new Date());
      setError('');
    } catch {
      if (!silent) {
        setError('No se pudo obtener el pedido');
        toast.error('Error al actualizar el estado del pedido');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notificaciones/');
      const nuevas = data.filter((n) => !n.leida);
      if (nuevas.length > notifs.length && notifs.length > 0) {
        toast.info(nuevas[0].mensaje);
      }
      setNotifs(nuevas);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!cliente) { navigate('/login'); return; }
    fetchPedido();
    fetchNotifs();
    intervalRef.current = setInterval(() => {
      fetchPedido(true);
      fetchNotifs();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [id, cliente]);

  const marcarLeida = async (notifId) => {
    await api.patch(`/notificaciones/${notifId}/leida`);
    setNotifs((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleRefresh = () => {
    fetchPedido();
    fetchNotifs();
    toast.info('Estado actualizado');
  };

  if (error && !pedido) return (
    <div className="page">
      <p className="error-msg">{error}</p>
      <button className="btn-primary" onClick={() => fetchPedido()}>Reintentar</button>
    </div>
  );
  
  if (!pedido) return (
    <div className="page">
      <div className="loading-state">
        <div className="skeleton-card" style={{ height: '200px' }}></div>
        <p className="info-msg">Cargando pedido…</p>
      </div>
    </div>
  );

  const estadoIdx = ESTADO_ORDER.indexOf(pedido.estado);
  const isCompleted = pedido.estado === 'ENTREGADO';

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item" onClick={() => navigate('/menu')} style={{ cursor: 'pointer' }}>Menú</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Pedido #{pedido.numero_pedido}</span>
      </nav>

      <div className="order-status-header">
        <h1>Pedido #{pedido.numero_pedido}</h1>
        <button 
          className={`btn-ghost refresh-btn ${refreshing ? 'refreshing' : ''}`} 
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Actualizar estado"
        >
          ↻
        </button>
      </div>

      {lastUpdate && (
        <p className="last-update">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      {notifs.length > 0 && (
        <div className="notif-banner">
          {notifs.map((n) => (
            <div key={n.id} className="notif-item">
              <span>🔔 {n.mensaje}</span>
              <button onClick={() => marcarLeida(n.id)} className="btn-ghost-sm" aria-label="Marcar como leída">✓</button>
            </div>
          ))}
        </div>
      )}

      <div className="status-tracker">
        {ESTADO_ORDER.map((e, i) => (
          <div key={e} className={`status-step ${i <= estadoIdx ? 'done' : ''} ${i === estadoIdx ? 'current' : ''}`}>
            <div className="status-dot">
              {i <= estadoIdx && <span className="status-icon">{ESTADO_ICONS[e]}</span>}
            </div>
            <span className="status-label">{ESTADO_LABEL[e]}</span>
            {i === estadoIdx && (
              <span className="status-time">{ESTADO_TIEMPO[e]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="order-summary">
        <h2>Detalle del pedido</h2>
        <ul className="order-items">
          {pedido.items.map((i) => (
            <li key={i.id} className="order-item">
              <span>{i.nombre_producto} × {i.cantidad}</span>
              <span>${(i.precio_unitario * i.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="order-total">
          <strong>Total</strong>
          <strong>${pedido.monto_total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="order-actions">
        {isCompleted ? (
          <Link to="/menu" className="btn-primary">Hacer otro pedido</Link>
        ) : (
          <div className="order-actions-group">
            <Link to="/menu" className="btn-ghost">Seguir pidiendo</Link>
            <button className="btn-ghost" onClick={handleRefresh}>
              {refreshing ? 'Actualizando...' : 'Actualizar estado'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
