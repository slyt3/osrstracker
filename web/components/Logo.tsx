import type { SVGProps } from "react";

// Brand mark: a coin ring with an upward arrow — "a coin, going up". Single
// colour (currentColor), geometric, crisp at small sizes. No glow, no gradient.
export function LogoMark({ size = 28, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="16" cy="16" r="13.25" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 22.5V10.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10.75 15.5 16 10.25 21.25 15.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Full lockup: gold mark + a single-colour, tightly-set wordmark.
export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span className="wordmark">
      <LogoMark size={size} className="wm-mark" />
      <span className="wm-text">OSRS&nbsp;Tracker</span>
    </span>
  );
}
