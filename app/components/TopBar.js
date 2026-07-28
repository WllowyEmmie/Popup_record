import { fmt } from "./icons";

export default function TopBar({ revenue, itemsSold, salesCount, online }) {
  return (
    <header className="topbar">
      <div className="stat">
        <span className="label">Revenue</span>
        <span className="value">{fmt(revenue)}</span>
      </div>
      <div className="stat">
        <span className="label">Items</span>
        <span className="value">{itemsSold}</span>
      </div>
      <div className="stat">
        <span className="label">Sales</span>
        <span className="value">{salesCount}</span>
      </div>
      <div className="conn">
        <span className={"dot" + (online ? "" : " off")} />
        <span>{online ? "Online" : "Offline"}</span>
      </div>
    </header>
  );
}
