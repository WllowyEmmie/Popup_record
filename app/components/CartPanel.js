import { fmt } from "./icons";

export default function CartPanel({
  cartItems,
  cartTotal,
  cartCount,
  sheetOpen,
  onToggleSheet,
  onChangeQty,
  buyerName,
  onBuyerNameChange,
  onCompleteSale
}) {
  const cartIsEmpty = cartItems.length === 0;
  const sheetSummary = cartCount
    ? `${cartCount} item${cartCount > 1 ? "s" : ""} · ${fmt(cartTotal)}`
    : "Ticket empty";

  return (
    <div className="cart-panel">
      <button className="sheet-toggle" onClick={onToggleSheet}>
        <span>{sheetSummary}</span>
        <span>{sheetOpen ? "▾" : "▸"}</span>
      </button>
      <div className={"cart-body scroll" + (sheetOpen ? "" : " collapsed")}>
        <div className="ticket-title">Ticket</div>

        {cartIsEmpty ? (
          <div className="cart-empty">Tap products to add them.</div>
        ) : (
          cartItems.map((ci) => (
            <div className="cart-row" key={ci.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ci-name">{ci.name}</div>
                <div className="ci-line">
                  {ci.qty} × {fmt(ci.price)} = {fmt(ci.qty * ci.price)}
                </div>
              </div>
              <button className="step-btn" onClick={() => onChangeQty(ci.id, -1)}>
                −
              </button>
              <span className="ci-qty">{ci.qty}</span>
              <button className="step-btn" onClick={() => onChangeQty(ci.id, 1)}>
                +
              </button>
            </div>
          ))
        )}

        <div className="field">
          <label>Buyer (optional)</label>
          <input
            type="text"
            placeholder="—"
            value={buyerName}
            onChange={(e) => onBuyerNameChange(e.target.value)}
          />
        </div>

        <div className="total-row">
          <span className="label">Total</span>
          <span className="value">{fmt(cartTotal)}</span>
        </div>

        <button className="btn-complete" disabled={cartIsEmpty} onClick={onCompleteSale}>
          Complete Sale
        </button>
      </div>
    </div>
  );
}
