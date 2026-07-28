import { fmt } from "./icons";

export default function ExportTab({ transactions, onDownloadCsv, onDownloadPdf }) {
  const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const itemsSold = transactions.reduce(
    (sum, t) => sum + t.items.reduce((a, it) => a + it.qty, 0),
    0
  );
  const noTx = transactions.length === 0;

  const rows = [];
  transactions.forEach((t) => {
    const time = new Date(t.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    t.items.forEach((it) => {
      rows.push({ time, product: it.name, qty: it.qty, total: fmt(it.price * it.qty) });
    });
  });

  return (
    <div className="tabpage scroll">
      <div className="tabpage-title">End-of-day Export</div>
      <div className="tabpage-desc">
        Download today's sales as a spreadsheet or PDF to close out your books — a preview of
        every line is below.
      </div>
      <div className="badges">
        <div className="badge blue">{transactions.length} SALES</div>
        <div className="badge green">{itemsSold} ITEMS</div>
      </div>
      <div className="export-note">
        Every line item — time, product, quantity, unit price, total.
      </div>
      <div className="export-actions">
        <button className="btn-csv" disabled={noTx} onClick={onDownloadCsv}>
          Download CSV
        </button>
        <button className="btn-csv" disabled={noTx} onClick={onDownloadPdf}>
          Download PDF
        </button>
      </div>

      {rows.length ? (
        <table className="preview">
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.time}</td>
                <td>{r.product}</td>
                <td>{r.qty}</td>
                <td>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="export-empty">Nothing to export yet.</div>
      )}
    </div>
  );
}
