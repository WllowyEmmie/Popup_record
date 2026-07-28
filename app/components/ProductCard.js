import { ICONS, fmt } from "./icons";

export default function ProductCard({ product, cartQty, onAdd, onRemove, onStock }) {
  const cartQtyZero = !(cartQty > 0);
  return (
    <div className="p-card">
      {cartQty ? <div className="p-badge">{cartQty}</div> : null}
      <div className="p-top">
        <div className="p-icon">{ICONS[product.icon]}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="p-name">{product.name}</div>
          <div className="p-price">{fmt(product.price)}</div>
        </div>
      </div>
      <div className="p-stockrow">
        <span className="label">Stock</span>
        <div className="stepper">
          <button className="step-btn" onClick={() => onStock(product.id, -1)}>
            −
          </button>
          <span className="stock-val">{product.stock}</span>
          <button className="step-btn" onClick={() => onStock(product.id, 1)}>
            +
          </button>
        </div>
      </div>
      <div className="p-actions">
        <button className="btn-remove" disabled={cartQtyZero} onClick={() => onRemove(product.id)}>
          Remove
        </button>
        <button className="btn-add" onClick={() => onAdd(product.id)}>
          Add
        </button>
      </div>
    </div>
  );
}
