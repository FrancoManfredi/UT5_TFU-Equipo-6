import { useCart } from '../context/CartContext';

export default function ProductCard({ producto }) {
  const { items, addItem, removeItem } = useCart();
  const cartItem = items.find((i) => i.producto_id === producto.id);
  const qty = cartItem ? cartItem.cantidad : 0;

  const noStock = producto.disponibilidad === 0;

  return (
    <div className={`product-card ${noStock ? 'out-of-stock' : ''}`}>
      <div className="product-categoria">{producto.categoria}</div>
      <h3 className="product-nombre">{producto.nombre}</h3>
      <p className="product-desc">{producto.descripcion}</p>
      <div className="product-footer">
        <span className="product-precio">${producto.precio.toFixed(2)}</span>
        {noStock ? (
          <span className="badge-sin-stock">Sin stock</span>
        ) : qty === 0 ? (
          <button className="btn-primary" onClick={() => addItem(producto)}>Agregar</button>
        ) : (
          <div className="qty-control">
            <button onClick={() => removeItem(producto.id)}>−</button>
            <span>{qty}</span>
            <button onClick={() => addItem(producto)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
