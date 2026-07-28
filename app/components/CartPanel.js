import { useEffect, useRef } from "react";
import gsap from "gsap";
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

  const panelRef = useRef(null);
  const prevCount = useRef(0);

  // Wiggles whenever an item is added, and also on mount — which covers
  // navigating back to the Sale tab, since this panel remounts fresh then.
  useEffect(() => {
    if (cartCount > prevCount.current && panelRef.current) {
      gsap.killTweensOf(panelRef.current);
      gsap
        .timeline()
        .to(panelRef.current, { rotate: -6, x: -7, duration: 0.07, ease: "power1.out" })
        .to(panelRef.current, { rotate: 6, x: 7, duration: 0.12, ease: "power1.inOut" })
        .to(panelRef.current, { rotate: -5, x: -5, duration: 0.12, ease: "power1.inOut" })
        .to(panelRef.current, { rotate: 4, x: 4, duration: 0.11, ease: "power1.inOut" })
        .to(panelRef.current, { rotate: -2, x: -2, duration: 0.1, ease: "power1.inOut" })
        .to(panelRef.current, { rotate: 0, x: 0, duration: 0.09, ease: "power1.inOut" });
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <div className="cart-panel" ref={panelRef}>
      <button className="sheet-toggle" onClick={onToggleSheet}>
        <span>{sheetSummary}</span>
        <span className="toggle-arrow">{sheetOpen ? "▾" : "▸"}</span>
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
