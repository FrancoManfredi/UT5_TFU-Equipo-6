import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const METODOS = [
  { value: 'EFECTIVO', label: '💵 Efectivo', desc: 'Pagá al retirar' },
  { value: 'TARJETA', label: '💳 Tarjeta', desc: 'Crédito o débito' },
  { value: 'MERCADOPAGO', label: '📱 MercadoPago', desc: 'Pago online' },
];

export default function CheckoutPage() {
  const { cliente } = useAuth();
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!cliente) { navigate('/login'); return null; }
  if (items.length === 0) { navigate('/menu'); return null; }

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const { data: pedido } = await api.post('/pedidos/', {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });

      await api.post(`/pedidos/${pedido.id}/pagar`, { metodo_pago: metodo });

      clearCart();
      toast.success('¡Pedido confirmado! Ya podés seguir el estado.');
      navigate(`/order/${pedido.id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      if (errorMsg?.includes('stock')) {
        toast.error('Algunos productos ya no tienen stock. Revisá tu pedido.');
      } else {
        toast.error(errorMsg || 'No pudimos procesar tu pedido. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item" onClick={() => navigate('/menu')} style={{ cursor: 'pointer' }}>Menú</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Confirmar pedido</span>
      </nav>

      <h1>Confirmar pedido</h1>

      <div className="checkout-layout">
        <div className="order-summary">
          <div className="summary-header">
            <h2>Tu pedido</h2>
            <button className="btn-ghost-sm" onClick={() => navigate('/menu')}>Editar</button>
          </div>
          <ul className="order-items">
            {items.map((i) => (
              <li key={i.producto_id} className="order-item">
                <div className="item-details">
                  <span className="item-name">{i.nombre}</span>
                  <div className="item-controls">
                    <button 
                      className="qty-btn-sm" 
                      onClick={() => {
                        if (i.cantidad === 1) {
                          removeItem(i.producto_id);
                          toast.info(`${i.nombre} eliminado del pedido`);
                        } else {
                          updateQuantity(i.producto_id, i.cantidad - 1);
                        }
                      }}
                      aria-label={`Reducir cantidad de ${i.nombre}`}
                    >
                      −
                    </button>
                    <span className="item-qty">{i.cantidad}</span>
                    <button 
                      className="qty-btn-sm" 
                      onClick={() => updateQuantity(i.producto_id, i.cantidad + 1)}
                      aria-label={`Aumentar cantidad de ${i.nombre}`}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn" 
                      onClick={() => {
                        removeItem(i.producto_id);
                        toast.info(`${i.nombre} eliminado del pedido`);
                      }}
                      aria-label={`Eliminar ${i.nombre}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <span className="item-price">${(i.precio * i.cantidad).toFixed(2)}</span>
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
                <div className="payment-label">
                  <span className="payment-name">{m.label}</span>
                  <span className="payment-desc">{m.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="checkout-actions">
            <button className="btn-ghost" onClick={() => navigate('/menu')}>← Seguir pidiendo</button>
            <button className="btn-primary btn-large" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Procesando…
                </>
              ) : `Confirmar · $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Confirmás tu pedido?</h3>
            <p>Vas a pagar <strong>${total.toFixed(2)}</strong> con <strong>{METODOS.find(m => m.value === metodo)?.label}</strong></p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleConfirm}>Sí, confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
