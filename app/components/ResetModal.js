export default function ResetModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-title">Reset all data?</div>
        <div className="modal-body-text">
          This will restore all products, stock levels, and sales history to their default
          values. This action cannot be undone.
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Back
          </button>
          <button className="btn-reset-confirm" onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
