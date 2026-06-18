import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const SIGUIENTE_ESTADO = {
  PAGADO: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'ENTREGADO',
};

const BOTON_LABEL = {
  PAGADO: '🍳 Iniciar preparación',
  EN_PREPARACION: '✅ Marcar como Listo',
  LISTO: '📦 Marcar Entregado',
};

const ESTADO_COLOR = {
  PAGADO: '#f59e0b',
  EN_PREPARACION: '#3b82f6',
  LISTO: '#10b981',
};

const ESTADO_LABEL = {
  PAGADO: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
};

const getTiempoEnEstado = (fechaEstado) => {
  if (!fechaEstado) return null;
  const diff = Date.now() - new Date(fechaEstado).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Justo ahora';
  if (mins === 1) return '1 min';
  return `${mins} min`;
};

export default function KitchenPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);
  const toast = useToast();

  const fetchPedidos = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get('/cocina/pedidos');
      setPedidos(data);
      setLastUpdate(new Date());
    } catch {
      if (!silent) toast.error('Error al actualizar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    intervalRef.current = setInterval(() => fetchPedidos(true), 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const avanzarEstado = async (pedidoId, estadoActual, numeroPedido) => {
    const nuevoEstado = SIGUIENTE_ESTADO[estadoActual];
    if (!nuevoEstado) return;
    
    setLoading(true);
    try {
      await api.patch(`/cocina/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      await fetchPedidos(true);
      toast.success(`Pedido #${numeroPedido}: ${ESTADO_LABEL[nuevoEstado] || nuevoEstado}`);
    } catch {
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (pedido) => {
    setConfirmModal({
      pedidoId: pedido.id,
      estadoActual: pedido.estado,
      numeroPedido: pedido.numero_pedido,
      accion: BOTON_LABEL[pedido.estado],
    });
  };

  const handleConfirm = () => {
    if (confirmModal) {
      avanzarEstado(confirmModal.pedidoId, confirmModal.estadoActual, confirmModal.numeroPedido);
      setConfirmModal(null);
    }
  };

  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    const orden = { PAGADO: 0, EN_PREPARACION: 1, LISTO: 2 };
    return orden[a.estado] - orden[b.estado];
  });

  return (
    <div className="page">
      <div className="kitchen-header">
        <div>
          <h1>🍔 Vista de Cocina</h1>
          {lastUpdate && (
            <p className="last-update">
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button 
          className={`btn-ghost refresh-btn ${loading ? 'refreshing' : ''}`} 
          onClick={() => fetchPedidos()}
          disabled={loading}
          aria-label="Actualizar pedidos"
        >
          ↻ Actualizar
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🎉</p>
          <p>Sin pedidos activos</p>
          <p className="empty-subtitle">Los nuevos pedidos aparecerán acá</p>
        </div>
      ) : (
        <div className="kitchen-grid">
          {pedidosOrdenados.map((p) => (
            <div 
              key={p.id} 
              className={`kitchen-card ${p.estado === 'PAGADO' ? 'kitchen-card-urgent' : ''}`}
              style={{ borderColor: ESTADO_COLOR[p.estado] }}
            >
              <div className="kitchen-card-header" style={{ background: ESTADO_COLOR[p.estado] }}>
                <div className="kitchen-card-title">
                  <strong>Pedido #{p.numero_pedido}</strong>
                  {p.fecha_estado && (
                    <span className="kitchen-time">
                      ⏱ {getTiempoEnEstado(p.fecha_estado)}
                    </span>
                  )}
                </div>
                <span className="estado-badge">{p.estado.replace('_', ' ')}</span>
              </div>
              <ul className="kitchen-items">
                {p.items.map((i) => (
                  <li key={i.id}>
                    <span className="item-qty">× {i.cantidad}</span>
                    <span className="item-name">{i.nombre_producto}</span>
                  </li>
                ))}
              </ul>
              {SIGUIENTE_ESTADO[p.estado] && (
                <button
                  className="btn-primary kitchen-btn"
                  disabled={loading}
                  onClick={() => handleButtonClick(p)}
                >
                  {BOTON_LABEL[p.estado]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Confirmar acción?</h3>
            <p>
              Pedido <strong>#{confirmModal.numeroPedido}</strong>:<br />
              {confirmModal.accion}
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleConfirm}>Sí, confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
