import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// GE-tracker data world: Hanken Grotesk carries UI/body/display (weight does
// the hierarchy); JetBrains Mono sets the tabular gp figures.
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OSRS Tracker — live Grand Exchange flips",
  description:
    "Live Old School RuneScape Grand Exchange prices and profitable flips — margins after the 2% GE tax, ranked and filterable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
