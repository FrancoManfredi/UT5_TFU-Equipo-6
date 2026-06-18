import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado ✅',
  EN_PREPARACION: 'En preparación 👨‍🍳',
  LISTO: '¡Listo para retirar! 🎉',
  ENTREGADO: 'Entregado 🏁',
};

const ESTADO_ORDER = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];

export default function OrderStatusPage() {
  const { id } = useParams();
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchPedido = async () => {
    try {
      const { data } = await api.get(`/pedidos/${id}`);
      setPedido(data);
    } catch {
      setError('No se pudo obtener el pedido');
    }
  };

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notificaciones/');
      setNotifs(data.filter((n) => !n.leida));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!cliente) { navigate('/login'); return; }
    fetchPedido();
    fetchNotifs();
    intervalRef.current = setInterval(() => {
      fetchPedido();
      fetchNotifs();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [id, cliente]);

  const marcarLeida = async (notifId) => {
    await api.patch(`/notificaciones/${notifId}/leida`);
    setNotifs((prev) => prev.filter((n) => n.id !== notifId));
  };

  if (error) return <div className="page"><p className="error-msg">{error}</p></div>;
  if (!pedido) return <div className="page"><p className="info-msg">Cargando…</p></div>;

  const estadoIdx = ESTADO_ORDER.indexOf(pedido.estado);

  return (
    <div className="page">
      <h1>Pedido #{pedido.numero_pedido}</h1>

      {notifs.length > 0 && (
        <div className="notif-banner">
          {notifs.map((n) => (
            <div key={n.id} className="notif-item">
              🔔 {n.mensaje}
              <button onClick={() => marcarLeida(n.id)} className="btn-ghost-sm">✓</button>
            </div>
          ))}
        </div>
      )}

      <div className="status-tracker">
        {ESTADO_ORDER.map((e, i) => (
          <div key={e} className={`status-step ${i <= estadoIdx ? 'done' : ''} ${i === estadoIdx ? 'current' : ''}`}>
            <div className="status-dot" />
            <span>{ESTADO_LABEL[e]}</span>
          </div>
        ))}
      </div>

      <div className="order-summary">
        <h2>Detalle</h2>
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
        <Link to="/menu" className="btn-primary">Hacer otro pedido</Link>
      </div>
    </div>
  );
}
