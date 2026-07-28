"use client";

import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";
import ProductCard from "./components/ProductCard";
import CartPanel from "./components/CartPanel";
import LogTab from "./components/LogTab";
import ExportTab from "./components/ExportTab";
import EditModal from "./components/EditModal";
import { DEFAULT_PRODUCTS } from "./components/icons";
import { buildPdf, pdfMoney, padCol } from "./lib/pdf";

const STORAGE_KEY = "popupSalePOS:v1";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("sale");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [transactions, setTransactions] = useState([]);
  const [editingTxnId, setEditingTxnId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [stampVisible, setStampVisible] = useState(false);
  const [online, setOnline] = useState(true);

  // Load persisted state on mount (guarded so SSR/client first render match).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        if (Array.isArray(saved.products)) {
          setProducts(
            DEFAULT_PRODUCTS.map((dp) => {
              const sp = saved.products.find((x) => x.id === dp.id);
              return sp && typeof sp.stock === "number" ? { ...dp, stock: sp.stock } : dp;
            })
          );
        }
        if (Array.isArray(saved.transactions)) setTransactions(saved.transactions);
        if (saved.cart && typeof saved.cart === "object") setCart(saved.cart);
        if (typeof saved.buyerName === "string") setBuyerName(saved.buyerName);
      }
    } catch (e) {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  // Persist on every relevant change.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products: products.map((p) => ({ id: p.id, stock: p.stock })),
          transactions,
          cart,
          buyerName
        })
      );
    } catch (e) {
      // storage may be unavailable (private browsing, quota) — fail silently
    }
  }, [ready, products, transactions, cart, buyerName]);

  // Track real network status.
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Cache the app on first load so it can fully reload/relaunch with no
  // connectivity afterward (not just keep running in an already-open tab).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function findProduct(id) {
    return products.find((p) => p.id === id);
  }

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function changeCartQty(id, delta) {
    setCart((c) => {
      const next = (c[id] || 0) + delta;
      const n = { ...c };
      if (next <= 0) delete n[id];
      else n[id] = next;
      return n;
    });
  }

  function changeStock(id, delta) {
    setProducts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  }

  // Positive qty = items going out (sale), so stock goes down; pass negative
  // qty to give stock back (undo / delete / edit reducing a quantity).
  function adjustStockForItems(items) {
    setProducts((ps) =>
      ps.map((p) => {
        const it = items.find((i) => i.id === p.id);
        return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
      })
    );
  }

  function completeSale() {
    const ids = Object.keys(cart).filter((id) => cart[id] > 0);
    if (!ids.length) return;
    const items = ids.map((id) => {
      const p = findProduct(id);
      return { id, name: p.name, price: p.price, qty: cart[id] };
    });
    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const txn = {
      id: "t" + Date.now() + Math.random().toString(36).slice(2, 6),
      time: Date.now(),
      buyerName: buyerName.trim(),
      items,
      total
    };
    setTransactions((t) => [txn, ...t]);
    adjustStockForItems(items);
    setCart({});
    setBuyerName("");
    setSheetOpen(false);
    setStampVisible(true);
    setTimeout(() => setStampVisible(false), 900);
  }

  function undoLast() {
    if (!transactions.length) return;
    const removed = transactions[0];
    setTransactions((t) => t.slice(1));
    adjustStockForItems(removed.items.map((it) => ({ ...it, qty: -it.qty })));
  }

  function deleteTxn(id) {
    const t = transactions.find((x) => x.id === id);
    setTransactions((ts) => ts.filter((x) => x.id !== id));
    if (t) adjustStockForItems(t.items.map((it) => ({ ...it, qty: -it.qty })));
  }

  function openEdit(id) {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    setEditingTxnId(id);
    setEditDraft({ buyerName: t.buyerName, items: t.items.map((it) => ({ ...it })) });
  }

  function closeEdit() {
    setEditingTxnId(null);
    setEditDraft(null);
  }

  function changeEditQty(itemId, delta) {
    setEditDraft((d) => ({
      ...d,
      items: d.items
        .map((it) => (it.id === itemId ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    }));
  }

  function saveEdit() {
    if (!editDraft.items.length) {
      deleteTxn(editingTxnId);
      closeEdit();
      return;
    }
    const original = transactions.find((t) => t.id === editingTxnId);
    const total = editDraft.items.reduce((sum, it) => sum + it.price * it.qty, 0);
    setTransactions((ts) =>
      ts.map((t) =>
        t.id === editingTxnId
          ? { ...t, buyerName: editDraft.buyerName, items: editDraft.items, total }
          : t
      )
    );
    if (original) {
      // Reconcile stock for the quantity change on each item: more sold than
      // before takes further stock, less sold gives stock back.
      const ids = new Set([...original.items.map((it) => it.id), ...editDraft.items.map((it) => it.id)]);
      const deltas = Array.from(ids).map((id) => {
        const origQty = original.items.find((it) => it.id === id)?.qty || 0;
        const newQty = editDraft.items.find((it) => it.id === id)?.qty || 0;
        return { id, qty: newQty - origQty };
      });
      adjustStockForItems(deltas);
    }
    closeEdit();
  }

  function downloadCsv() {
    const rows = [["Time", "Product", "Quantity", "Unit Price", "Total"]];
    transactions.forEach((t) => {
      const time = new Date(t.time).toLocaleString();
      t.items.forEach((it) => rows.push([time, it.name, it.qty, it.price, it.price * it.qty]));
    });
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "popup-sales-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const col = { time: 10, product: 27, qty: 5, unit: 15, total: 15 };
    const header =
      padCol("Time", col.time) +
      padCol("Product", col.product) +
      padCol("Qty", col.qty, true) +
      padCol("Unit", col.unit, true) +
      padCol("Total", col.total, true);
    const rowWidth = header.length;
    const rule = "-".repeat(rowWidth);

    const lines = [
      "POPUP SALE -- END OF DAY REPORT",
      "Generated " + new Date().toLocaleString(),
      "",
      `Sales: ${transactions.length}    Items: ${itemsSold}    Revenue: ${pdfMoney(revenue)}`,
      "",
      header,
      rule
    ];
    transactions.forEach((t) => {
      const time = new Date(t.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      t.items.forEach((it) => {
        lines.push(
          padCol(time, col.time) +
            padCol(it.name, col.product) +
            padCol(it.qty, col.qty, true) +
            padCol(pdfMoney(it.price), col.unit, true) +
            padCol(pdfMoney(it.price * it.qty), col.total, true)
        );
      });
    });
    lines.push(rule);
    lines.push(("TOTAL " + pdfMoney(revenue)).padStart(rowWidth));

    const bytes = buildPdf(lines);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "popup-sales-" + new Date().toISOString().slice(0, 10) + ".pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const itemsSold = transactions.reduce(
    (sum, t) => sum + t.items.reduce((a, it) => a + it.qty, 0),
    0
  );

  const cartIds = Object.keys(cart).filter((id) => cart[id] > 0);
  const cartItems = cartIds.map((id) => {
    const p = findProduct(id);
    return { id, name: p.name, price: p.price, qty: cart[id] };
  });
  const cartTotal = cartItems.reduce((sum, ci) => sum + ci.price * ci.qty, 0);
  const cartCount = cartItems.reduce((sum, ci) => sum + ci.qty, 0);

  return (
    <div className="app">
      <TopBar revenue={revenue} itemsSold={itemsSold} salesCount={transactions.length} online={online} />
      <Tabs view={view} onChange={setView} />

      <main className="body">
        {view === "sale" && (
          <div className="sale-layout">
            {products.length ? (
              <div className="catalog scroll">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    cartQty={cart[p.id] || 0}
                    onAdd={addToCart}
                    onRemove={(id) => changeCartQty(id, -1)}
                    onStock={changeStock}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-catalog">
                <div className="box">
                  <div className="head" style={{ fontSize: 15, marginBottom: 6 }}>
                    No products yet
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                    Add your line-up before you open — name and price, that’s it.
                  </div>
                </div>
              </div>
            )}

            <CartPanel
              cartItems={cartItems}
              cartTotal={cartTotal}
              cartCount={cartCount}
              sheetOpen={sheetOpen}
              onToggleSheet={() => setSheetOpen((o) => !o)}
              onChangeQty={changeCartQty}
              buyerName={buyerName}
              onBuyerNameChange={setBuyerName}
              onCompleteSale={completeSale}
            />
          </div>
        )}

        {view === "log" && (
          <LogTab
            transactions={transactions}
            onUndo={undoLast}
            onEdit={openEdit}
            onDelete={deleteTxn}
          />
        )}

        {view === "export" && (
          <ExportTab
            transactions={transactions}
            onDownloadCsv={downloadCsv}
            onDownloadPdf={downloadPdf}
          />
        )}
      </main>

      <EditModal
        draft={editingTxnId ? editDraft : null}
        onBuyerChange={(val) => setEditDraft((d) => ({ ...d, buyerName: val }))}
        onChangeQty={changeEditQty}
        onCancel={closeEdit}
        onSave={saveEdit}
      />

      {stampVisible && (
        <div className="stamp">
          <span>SOLD</span>
        </div>
      )}
    </div>
  );
}
