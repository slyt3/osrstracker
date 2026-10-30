import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Serif_4, Instrument_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// Organic: Source Serif 4 for medium-weight statements and headings;
// Instrument Sans for reading and controls.
const display = Source_Serif_4({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "OSRS Tracker — live Grand Exchange flips",
  description:
    "Live Old School RuneScape Grand Exchange prices and profitable flips — margins after the 2% GE tax, ranked and filterable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
