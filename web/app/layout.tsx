import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Spectral, Spline_Sans_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// Lithic-lore trio for the runestone world:
// Cinzel  — inscriptional Roman capitals, letters cut into stone (display).
// Spectral — a reading serif with weight and screen legibility (body/UI).
// Spline Sans Mono — machined tabular numerals for the glowing gp figures.
const display = Cinzel({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Spectral({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OSRS Tracker — live Grand Exchange flips",
  description:
    "Live Old School RuneScape Grand Exchange prices and profitable flips — margins after the 2% GE tax, ranked and filterable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
