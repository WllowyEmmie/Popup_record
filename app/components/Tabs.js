export default function Tabs({ view, onChange }) {
  const items = [
    { id: "sale", label: "Sale" },
    { id: "log", label: "Log" },
    { id: "export", label: "Export" }
  ];
  return (
    <nav className="tabs">
      {items.map((t) => (
        <button
          key={t.id}
          className={"tab" + (view === t.id ? " active" : "")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
