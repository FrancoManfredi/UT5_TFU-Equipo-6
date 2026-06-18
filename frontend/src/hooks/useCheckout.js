import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function useCheckout() {
  const { cliente } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [metodo, setMetodo] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const processPayment = useCallback(async () => {
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
  }, [items, metodo, clearCart, toast, navigate]);

  const submitOrder = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const cancelOrder = useCallback(() => {
    setShowConfirm(false);
  }, []);

  return {
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
  };
}
