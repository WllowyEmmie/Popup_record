function Svg({ children }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const ICONS = {
  pens: (
    <Svg>
      <circle cx="13.5" cy="6.5" r=".4" />
      <circle cx="17.5" cy="10.5" r=".4" />
      <circle cx="8.5" cy="7.5" r=".4" />
      <circle cx="6.5" cy="12.5" r=".4" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1.1a1.6 1.6 0 0 1 1.6-1.6h2c3 0 5.5-2.5 5.5-5.6C22 6 17.5 2 12 2z" />
    </Svg>
  ),
  nopens: (
    <Svg>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </Svg>
  ),
  poster: (
    <Svg>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Svg>
  ),
  stickers: (
    <Svg>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  ),
  cards: (
    <Svg>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-9 5.7a1.9 1.9 0 0 1-2 0L2 7" />
    </Svg>
  ),
  bookmark: (
    <Svg>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  ),
  sketch: (
    <Svg>
      <path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z" />
      <path d="m15 5 4 4" />
    </Svg>
  )
};

export const DEFAULT_PRODUCTS = [
  { id: "pens", name: "Colouring Book + Pens", price: 30000, stock: 20, icon: "pens" },
  { id: "nopens", name: "Colouring Book (No Pens)", price: 25000, stock: 20, icon: "nopens" },
  { id: "poster", name: "A3 Art Poster", price: 15000, stock: 15, icon: "poster" },
  { id: "stickers", name: "Stickers", price: 7000, stock: 40, icon: "stickers" },
  { id: "cards", name: "Greeting Cards", price: 4000, stock: 30, icon: "cards" },
  { id: "bookmark", name: "Book Marks", price: 2000, stock: 40, icon: "bookmark" },
  { id: "sketch", name: "Sketchbook", price: 6000, stock: 20, icon: "sketch" }
];

export const CURRENCY = "₦";

export function fmt(n) {
  return CURRENCY + Math.round(n).toLocaleString("en-US");
}
