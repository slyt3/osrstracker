import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
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
        {/* Microsoft Clarity (analytics / session insights) */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "z5wa61ui2m");`}
        </Script>
      </body>
    </html>
  );
}
