import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const METODOS = [
  { value: 'EFECTIVO', label: '💵 Efectivo' },
  { value: 'TARJETA', label: '💳 Tarjeta' },
  { value: 'MERCADOPAGO', label: '📱 MercadoPago' },
];

export default function CheckoutPage() {
  const { cliente } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cliente) { navigate('/login'); return null; }
  if (items.length === 0) { navigate('/menu'); return null; }

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Crear pedido
      const { data: pedido } = await api.post('/pedidos/', {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });

      // 2. Pagar pedido
      await api.post(`/pedidos/${pedido.id}/pagar`, { metodo_pago: metodo });

      clearCart();
      navigate(`/order/${pedido.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Confirmar pedido</h1>

      <div className="checkout-layout">
        <div className="order-summary">
          <h2>Tu pedido</h2>
          <ul className="order-items">
            {items.map((i) => (
              <li key={i.producto_id} className="order-item">
                <span>{i.nombre} × {i.cantidad}</span>
                <span>${(i.precio * i.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="order-total">
            <strong>Total</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="payment-section">
          <h2>Método de pago</h2>
          <div className="payment-options">
            {METODOS.map((m) => (
              <label key={m.value} className={`payment-option ${metodo === m.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="metodo"
                  value={m.value}
                  checked={metodo === m.value}
                  onChange={() => setMetodo(m.value)}
                />
                {m.label}
              </label>
            ))}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="checkout-actions">
            <button className="btn-ghost" onClick={() => navigate('/menu')}>← Volver al menú</button>
            <button className="btn-primary btn-large" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Procesando…' : `Pagar $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
