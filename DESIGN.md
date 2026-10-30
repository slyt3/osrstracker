---
name: OSRS Tracker
description: A live Grand Exchange flip terminal in cool graphite with one flat signal accent.
colors:
  bg: "#0e0f12"
  bg-2: "#0a0b0d"
  panel: "#15171b"
  panel-2: "#1a1d22"
  line: "#22262b"
  line-2: "#2f343b"
  text: "#f4f6f8"
  muted: "#9aa2ad"
  faint: "#626a75"
  gain: "#27e07a"
  gain-2: "#5cf0a0"
  gain-dim: "#1c7d4b"
  loss: "#ff5c5c"
  ink-on-accent: "#04140b"
typography:
  display:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.8rem, 3.6vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  figure:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  md: "10px"
  sm: "7px"
  xs: "4px"
spacing:
  container: "24px"
  sm: "0.85rem"
  md: "1.3rem"
  lg: "2rem"
  xl: "2.6rem"
  section: "4.2rem"
components:
  button-primary:
    backgroundColor: "{colors.gain}"
    textColor: "{colors.ink-on-accent}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.gain-2}"
    textColor: "{colors.ink-on-accent}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1.15rem"
  button-ghost-hover:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "2rem"
  input:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text}"
    typography: "{typography.figure}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.65rem"
---

# Design System: OSRS Tracker

## Overview

**Creative North Star: "Graphite & Signal"**

OSRS Tracker is a cool, flat market terminal. The ground is a deliberately un-warm graphite (#0e0f12) — slate, not stone — carrying near-white type on hairline structure. There are no bevels, no glow, no gradients-as-decoration and no gold: the owner read every warm/parchment/carved-stone treatment as "AI slop" and rejected it. What remains is a quiet, dense surface where the only color is a single flat signal — green means gain, red means loss — and everything else is modelled in weight, scale and a 1px line.

The system runs on one accent economy. Green (#27e07a) is the live, positive signal; red (#ff5c5c) is the only second voice, reserved for loss. There is no third hue, no blue, no status palette, no decorative tint. Depth is not expressed by shadow — surfaces are flat panels edged by hairlines, and elevation reads as a change of ground tone (#0e0f12 → #15171b → #1a1d22), never as a floating card. The result reads unmistakably even with content stripped: a graphite field, near-white figures, hairline rules, and green/red numbers that mean exactly what they say.

The voice is blunt and the surface is instrumental. Nothing is ornamental, nothing floats, nothing fades up. The accent is scarce enough that when a figure turns full green it carries meaning — a real, fillable profit — rather than decoration.

**Key Characteristics:**
- Cool graphite ground (#0e0f12), deliberately not warm; recessed and raised tones layer without shadow.
- One flat signal accent: green = gain, red = loss. No gold, no third hue, no status palette.
- 1px hairline borders carry all structure; surfaces are flat, never floated on a grey shadow.
- Hierarchy from weight and scale, not uppercase tracking, color noise or ornament.
- Geist for everything typeset; Geist Mono for every market figure (tabular-nums). Soft-square 10px corners.

## Colors

A cool graphite neutral field carrying one flat accent in two charges — gain-green and loss-red — over a near-white text ramp. Hue never wanders outside green, red and neutral graphite.

### Primary
- **Signal Green** (#27e07a): The one carried color — the live/positive signal. Primary button fill, active and sort-active states, link hover, the LIVE blip, watchlist star, focus ring, and a fully realised (real + liquid) profit figure.
- **Bright Green** (#5cf0a0): The lit edge of the signal — primary button hover only.
- **Dim Green** (#1c7d4b): Un-proven gain — a profit figure that is positive but not yet proven liquid, and the Pro-plan border/inset ring. The same signal, held back until it earns full charge.

### Secondary
- **Loss Red** (#ff5c5c): The only second voice. Losses, the OFFLINE blip, the "what it doesn't" column, form errors, the low-liquidity flag and its warning note. Never decorative.

### Neutral
- **Graphite Ground** (#0e0f12) / **Recessed Graphite** (#0a0b0d): Body background, and the darker ground for inputs and sunk formulae.
- **Panel** (#15171b) / **Raised Panel** (#1a1d22): Flat card/panel faces, and the lifted tone for table headers and hovered rows.
- **Hairline** (#22262b) / **Strong Hairline** (#2f343b): The 1px structural line between rows, panel edges, and the heavier stroke on input borders and control groups.
- **Near-White** (#f4f6f8): Primary heading and body text.
- **Muted** (#9aa2ad) / **Faint** (#626a75): Subcopy and nav links, and the faintest labels / de-emphasized figures (tax, metadata).
- **Ink on Accent** (#04140b): The near-black green-black used for text sitting on a solid green fill (primary button, active range tab).

### Named Rules
**The One Signal Rule.** Color is spent only as signal: green for gain, red for loss. Nothing else on the screen carries a hue — no blue, no gold, no tinted panels, no decorative accent. Everything else is graphite, hairline and near-white, and emphasis is bought with weight and scale, never with color.

**The Lit-Means-Liquid Rule.** A profit figure shows full Signal Green (#27e07a, `.pos.lit`) only when it is both real and liquid/fillable; a positive-but-unproven profit stays Dim Green (#1c7d4b, `.pos`); a loss is red (`.neg`). Full green is a claim about fillability, not merely about sign.

## Typography

**Display / Body / UI Font:** Geist (with system-ui, -apple-system, sans-serif) — a clean modern grotesk that carries headlines, body and UI alike; weight does the hierarchy.
**Figure / Label Font:** Geist Mono (with ui-monospace, monospace) — tabular numerals for all market data.

**Character:** Neutral, precise, contemporary. A single grotesk family does the typesetting so the interface reads as one instrument; the mono is reserved so every price, ROI and volume reads as real, machine-exact market data.

### Hierarchy
- **Display** (Geist 600, clamp(2.4rem, 5.6vw, 4rem), line-height 1.0, letter-spacing -0.035em): The landing hero headline; the key phrase set in Signal Green. Max ~15ch.
- **Headline** (Geist 600, clamp(1.8rem, 3.6vw, 2.5rem), line-height 1.05, letter-spacing -0.03em): Section headings.
- **Title** (Geist 600, ~1.1rem, line-height 1.2, letter-spacing -0.015em): Panel and column titles, plan tiers.
- **Body** (Geist 400, 16px base — 1.1rem for the hero lede, line-height 1.6): Prose and subcopy; constrained to ~58ch.
- **Figure** (Geist Mono 400, 0.94rem, tabular-nums, letter-spacing -0.02em): Every gp value, ROI, volume, price and the tax formula.
- **Label** (Geist Mono 500, 0.68rem, letter-spacing 0, no transform): Field labels, table headers, the feed strip and metadata. Lowercase/sentence case — never tracked-out caps.

### Named Rules
**The Weight-Not-Decoration Rule.** Emphasis comes from weight (500/600) and scale, not from uppercase tracking, color or ornament. There is no all-caps eyebrow device: labels are quiet mono at letter-spacing 0, and a heading is never preceded by a tracked-out kicker.

**The Tabular-Figures Rule.** Every number sourced from the market feed is set in Geist Mono with `tabular-nums`. Figures never use the sans UI face; prose never uses the mono.

## Layout

Centered single-column measure, max-width 1120px, 24px side padding. Sections breathe at ~4.2rem vertical; the hero terminal runs tighter (3.2rem top). The landing signature is a three-piece stack reading as one unit: a mono status strip (rounded top corners only) sits flush atop the inscription lede, which sits flush atop the live board (rounded bottom corners only) — joined by shared hairline edges so the seams disappear. Two-column grids (honest ledger, tax panel, pricing) collapse to a single column at 820px, with the dividing border rotating from a left edge to a top edge. The dense board sheds its optional columns (`.col-opt`) and tightens cell padding at 760px rather than only scrolling horizontally. Must hold down to 360px. Rhythm is in rem (0.85 / 1.3 / 2 / 2.6 / 4.2).

## Elevation & Depth

This system is flat. There is no resting drop-shadow vocabulary: surfaces do not float. Depth is conveyed entirely by tonal layering of the graphite ground (recessed #0a0b0d → ground #0e0f12 → panel #15171b → raised #1a1d22) and by 1px hairline borders that draw structure. The only shadows in the build are functional, not elevation: a focus/validation ring on inputs, an inner accent ring on the recommended pricing plan, and the chart tooltip's cast. State is shown by tone and border shift, not by lift.

### Shadow Vocabulary
- **Focus ring** (`box-shadow: 0 0 0 2px rgba(39,224,122,0.2)`, paired with a Signal-Green border): Inputs and selects on focus. Not elevation — a focus affordance.
- **Pro accent ring** (`box-shadow: inset 0 0 0 1px rgba(39,224,122,0.18)`, with a Dim-Green border): The recommended pricing plan only.
- **Tooltip cast** (`box-shadow: 0 8px 24px rgba(0,0,0,0.5)`): The price-chart tooltip only — a transient overlay, the single place a soft cast is allowed.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest and separated by a 1px hairline, never by a shadow. A soft grey drop-shadow under a card is forbidden; if two surfaces must read apart, change the ground tone or draw a hairline. Shadows appear only as a focus ring, an accent ring, or a transient tooltip.

## Shapes

Modern soft-square. The corner radius is a restrained 10px (`--r`) on panels, cards, the board frame, header pills and notices; 7px (`--r-sm`) on controls (buttons, inputs, range toggles); 4px on small tags and the focus outline. The stacked terminal rounds only its outer corners (status strip top, board bottom) so the three pieces read as one slab. Borders are structural and always 1px — Hairline (#22262b) for dividers and panel edges, Strong Hairline (#2f343b) for input strokes and control groups. Form language is orthogonal and quiet: no pills, no large radii, no organic curves, no bevels.

## Components

### Buttons
Flat keys; hierarchy from fill vs. hairline. All buttons are Geist 600, 0.94rem, 7px radius, `0.62rem 1.15rem` padding, 1px border, with a `translateY(1px)` press on `:active` and 0.45 opacity when disabled.
- **Primary (`btn-gold`):** Solid Signal Green (#27e07a) fill with Ink-on-Accent (#04140b) text — the one solid-color control. Hover brightens the fill to Bright Green (#5cf0a0).
- **Ghost (secondary):** Transparent with a Strong-Hairline border and near-white text. Hover shifts the border to near-white and fills with Panel (#15171b).
- **Focus:** Global 2px solid Signal-Green outline, 2px offset.

### Cards / Containers
- **Corner Style:** Soft-square (10px).
- **Background:** Flat Panel (#15171b).
- **Shadow Strategy:** None — flat, per the Flat-By-Default Rule.
- **Border:** 1px Hairline (#22262b).
- **Internal Padding:** 2rem (`lg`); dense panels 2.6rem (`xl`).

### Inputs / Fields
- **Style:** Recessed into the darker ground (#0a0b0d), 1px Strong-Hairline border, 7px radius, Geist Mono text.
- **Focus:** Border shifts to Signal Green with a `0 0 0 2px rgba(39,224,122,0.2)` green ring; no glow.
- **Label:** Quiet Geist Mono 0.68rem at letter-spacing 0 in Faint, stacked above the field. Error text red (`.jf-err`), success text green (`.jf-ok`).

### Navigation
- Sticky flat bar (62px), translucent graphite (rgba(14,15,18,0.82)) with a 12px backdrop-blur and a 1px Hairline base. Links are Geist 500, 0.92rem, letter-spacing -0.01em, in Muted; hover → near-white. Wordmark is near-white with a Signal-Green mark.

### The Flip Board (signature)
The live table of flips, inside a hairline frame (10px, bottom-rounded under the hero). Sticky header row on Raised Panel (#1a1d22) with quiet Faint mono labels; sortable headers go near-white on hover and Signal Green when active. Figures are right-aligned Geist Mono tabular; the item name is the one left-aligned cell. Rows are ruled by 1px Hairline and warm to Panel (#15171b) on hover. The margin cell carries the Lit-Means-Liquid Rule (full green when real+liquid, dim green otherwise); tax is Faint, losses are red. Thin/low-liquidity rows dim the item name to Faint and carry a red flag. Members items carry a small green bordered "P" tag (`.mtag`).

## Do's and Don'ts

### Do:
- **Do** keep the ground cool graphite (#0e0f12) and layer depth with tone (#0a0b0d → #15171b → #1a1d22), not shadow.
- **Do** spend color only as signal: Signal Green (#27e07a) for gain, Loss Red (#ff5c5c) for loss, nothing else.
- **Do** reserve full Signal Green for a profit that is real AND liquid (the Lit-Means-Liquid Rule); keep unproven profit Dim Green (#1c7d4b).
- **Do** draw structure with 1px hairlines (#22262b / #2f343b) and keep surfaces flat.
- **Do** set every market figure in Geist Mono with tabular-nums; buy emphasis with weight and scale.
- **Do** keep corners soft-square (10px panels / 7px controls) and borders 1px.

### Don't:
- **Don't** reintroduce warm/fantasy dressing — no gold, parchment, wood, carved-stone, coin-gold or glow. The owner rejected these as "AI slop".
- **Don't** add a third hue — no blue, no status palette, no decorative tint. Green already means up, red means down.
- **Don't** float a surface on a soft grey drop-shadow; separate surfaces with tone or a hairline.
- **Don't** use bevels, inner-light modelling, or gradient-filled text; emphasis is weight, scale and the flat accent.
- **Don't** put an all-caps / tracked-out eyebrow or kicker above a heading. Labels are quiet mono at letter-spacing 0.
- **Don't** use pills, large radii, or organic curves; the form language is restrained soft-square.

<!-- not canonized: (1) globals.css retains legacy color aliases from prior worlds — `--gold`/`--gold-2`/`--gold-deep` aliased onto the greens, `--green`/`--red` onto `--gain`/`--loss`, and `--font-display` onto `--font-sans` — and a legacy `.eyebrow` class (now neutralized to text-transform:none / letter-spacing 0, mono faint). These are carried so older selectors keep resolving; they are drift, not sanctioned tokens, and new work must not resurrect `--gold`/eyebrows as design devices. The all-caps eyebrow is a brand/craft-floor defect banned by AGENTS.md and PRODUCT.md. (2) The landing (page.tsx) applies `.pos.lit` (full green) to every margin row rather than gating on real liquidity; the Lit-Means-Liquid Rule is the system intent and `.pos`/`.pos.lit` are the correct tokens, but that blanket application is a surface-level deviation. (3) Hero/section copy still carries a stray runestone-era phrase ("chiselled in") — stale content, not a visual token. Nothing repaired: write boundary excludes web/. Reported as pre-existing drift. -->
