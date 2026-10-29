import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cinzel } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-cinzel", display: "swap" });

export const metadata: Metadata = {
  title: "OSRS Tracker — live Grand Exchange flips",
  description:
    "Live Old School RuneScape Grand Exchange prices and profitable flips — margins after the 2% GE tax, ranked and filterable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
