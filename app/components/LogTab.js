import { fmt } from "./icons";

export default function LogTab({ transactions, onUndo, onEdit, onDelete, onResetClick }) {
  const noTx = transactions.length === 0;

  return (
    <div className="tabpage scroll">
      <div className="tabpage-head">
        <div className="tabpage-title">Sales Log</div>
        <button className="btn-ghost" disabled={noTx} onClick={onUndo}>
          Undo last sale
        </button>
      </div>
      <div className="tabpage-desc">
        Every sale you've made today, newest first — edit an entry, delete a mistake, or undo the
        most recent sale.
      </div>

      {noTx ? (
        <div className="log-empty">No sales logged yet.</div>
      ) : (
        transactions.map((t) => {
          const timeLabel = new Date(t.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });
          const buyerLabel = t.buyerName || "Walk-in";
          const itemsSummary = t.items.map((it) => `${it.qty}× ${it.name}`).join(", ");
          return (
            <div className="log-entry" key={t.id}>
              <div className="row1">
                <span className="buyer">{buyerLabel}</span>
                <span className="time">{timeLabel}</span>
              </div>
              <div className="items">{itemsSummary}</div>
              <div className="row2">
                <span className="total">{fmt(t.total)}</span>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="icon-btn" onClick={() => onEdit(t.id)}>
                    ✎
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(t.id)}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="reset-row">
        <button className="btn-reset" onClick={onResetClick}>
          Reset
        </button>
      </div>
    </div>
  );
}
