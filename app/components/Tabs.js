import { useLayoutEffect, useRef, useState } from "react";

export default function Tabs({ view, onChange }) {
  const items = [
    { id: "sale", label: "Sale" },
    { id: "log", label: "Log" },
    { id: "export", label: "Export" }
  ];
  const btnRefs = useRef([]);
  const [indicator, setIndicator] = useState(null);

  useLayoutEffect(() => {
    const i = items.findIndex((t) => t.id === view);
    const el = btnRefs.current[i];
    if (!el) return;
    const update = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <nav className="tabs">
      {items.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => (btnRefs.current[i] = el)}
          className={"tab" + (view === t.id ? " active" : "")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
      {indicator && (
        <span
          className="tab-indicator"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </nav>
  );
}
