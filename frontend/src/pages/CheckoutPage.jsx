import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCheckout } from '../hooks/useCheckout';

const METODOS = [
  { value: 'EFECTIVO', label: '💵 Efectivo', desc: 'Pagá al retirar' },
  { value: 'TARJETA', label: '💳 Tarjeta', desc: 'Crédito o débito' },
  { value: 'MERCADOPAGO', label: '📱 MercadoPago', desc: 'Pago online' },
];

export default function CheckoutPage() {
  const { removeItem, updateQuantity } = useCart();
  const toast = useToast();
  const {
    cliente,
    items,
    total,
    metodo,
    setMetodo,
    loading,
    showConfirm,
    processPayment,
    submitOrder,
    cancelOrder,
    navigate,
  } = useCheckout();

  if (!cliente) { navigate('/login'); return null; }
  if (items.length === 0) { navigate('/menu'); return null; }

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
            <button className="btn-primary btn-large" onClick={submitOrder} disabled={loading}>
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
        <div className="modal-overlay" onClick={cancelOrder}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Confirmás tu pedido?</h3>
            <p>Vas a pagar <strong>${total.toFixed(2)}</strong> con <strong>{METODOS.find(m => m.value === metodo)?.label}</strong></p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelOrder}>Cancelar</button>
              <button className="btn-primary" onClick={processPayment}>Sí, confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
