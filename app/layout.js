import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-head",
  display: "swap"
});

export const metadata = {
  title: "Pop-up Sale POS",
  description: "Fast, one-handed sale recording for pop-up shops.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pop-up POS"
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#EFEDE6"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexMono.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
