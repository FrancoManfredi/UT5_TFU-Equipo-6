import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const SIGUIENTE_ESTADO = {
  PAGADO: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'ENTREGADO',
};

const BOTON_LABEL = {
  PAGADO: 'Iniciar preparación',
  EN_PREPARACION: 'Marcar como Listo',
  LISTO: 'Marcar Entregado',
};

const ESTADO_COLOR = {
  PAGADO: '#f59e0b',
  EN_PREPARACION: '#3b82f6',
  LISTO: '#10b981',
};

export default function KitchenPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchPedidos = async () => {
    try {
      const { data } = await api.get('/cocina/pedidos');
      setPedidos(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchPedidos();
    intervalRef.current = setInterval(fetchPedidos, 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const avanzarEstado = async (pedidoId, estadoActual) => {
    const nuevoEstado = SIGUIENTE_ESTADO[estadoActual];
    if (!nuevoEstado) return;
    setLoading(true);
    try {
      await api.patch(`/cocina/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      await fetchPedidos();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="kitchen-header">
        <h1>🍔 Vista de Cocina</h1>
        <button className="btn-ghost" onClick={fetchPedidos}>↻ Actualizar</button>
      </div>

      {pedidos.length === 0 ? (
        <div className="empty-state">
          <p>Sin pedidos activos</p>
        </div>
      ) : (
        <div className="kitchen-grid">
          {pedidos.map((p) => (
            <div key={p.id} className="kitchen-card" style={{ borderColor: ESTADO_COLOR[p.estado] }}>
              <div className="kitchen-card-header" style={{ background: ESTADO_COLOR[p.estado] }}>
                <strong>Pedido #{p.numero_pedido}</strong>
                <span className="estado-badge">{p.estado.replace('_', ' ')}</span>
              </div>
              <ul className="kitchen-items">
                {p.items.map((i) => (
                  <li key={i.id}>× {i.cantidad} — {i.nombre_producto}</li>
                ))}
              </ul>
              {SIGUIENTE_ESTADO[p.estado] && (
                <button
                  className="btn-primary kitchen-btn"
                  disabled={loading}
                  onClick={() => avanzarEstado(p.id, p.estado)}
                >
                  {BOTON_LABEL[p.estado]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
