import { fmt } from "./icons";

export default function EditModal({ draft, onBuyerChange, onChangeQty, onCancel, onSave }) {
  if (!draft) return null;
  const total = draft.items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-title">Edit sale</div>
        <div className="field">
          <label>Buyer name</label>
          <input
            type="text"
            value={draft.buyerName}
            onChange={(e) => onBuyerChange(e.target.value)}
          />
        </div>
        {draft.items.map((it) => (
          <div className="edit-row" key={it.id}>
            <div className="name">{it.name}</div>
            <button className="step-btn-lg" onClick={() => onChangeQty(it.id, -1)}>
              −
            </button>
            <span className="ci-qty">{it.qty}</span>
            <button className="step-btn-lg" onClick={() => onChangeQty(it.id, 1)}>
              +
            </button>
          </div>
        ))}
        <div className="modal-total">
          <span className="label">New total</span>
          <span className="value">{fmt(total)}</span>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-save" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
