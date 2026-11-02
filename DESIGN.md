---
name: OSRS Tracker
description: A live Grand Exchange flip terminal on warm sand paper, moss and fired clay, with hand-cut irregular corners.
colors:
  ground: "#eee6d6"
  surface: "#f5eddf"
  surface-muted: "#ddd5c3"
  ink: "#29251d"
  ink-muted: "#443b2f"
  faint: "#6f6450"
  line: "#d9ceb7"
  line-2: "#c6b99d"
  primary: "#35422d"
  field: "#694737"
  art-accent: "#ad7d62"
  highlight: "#b9b28b"
  loss: "#a2432a"
  on-field: "#f1ead9"
  on-field-muted: "#cdc2a4"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(46px, 6vw, 70px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Instrument Sans, Helvetica Neue, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "normal"
  figure:
    fontFamily: "Instrument Sans, Helvetica Neue, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Instrument Sans, Helvetica Neue, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sheet: "30px 22px 34px 20px / 24px 30px 22px 34px"
  control: "27px 19px 29px 16px / 22px 26px 19px 29px"
  field: "16px 12px 18px 11px"
  tag: "8px 5px 9px 4px"
spacing:
  content-gap: "24px"
  container: "24px"
  section: "4.4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  button-primary-hover:
    backgroundColor: "#40502f"
    textColor: "{colors.on-field}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "2.1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.field}"
    padding: "0.55rem 0.7rem"
---

# Design System: OSRS Tracker

## Overview

**Creative North Star: "The Worktable"**

OSRS Tracker is a shared worktable of sand-colored paper. The ground is a warm sand (#eee6d6) carrying a faint, continuous paper grain — authored feTurbulence noise, not a grid — and the working surfaces are slightly lighter paper sheets (#f5eddf) with dark-brown ink (#29251d). It is a light, earthen room: moss green, fired clay and terracotta do the colored work, and every sheet and control is cut with irregular, hand-made corners so nothing reads as a machine-stamped card. Figures stay legible as ink on paper; the loud, data-dense moments (the honest ledger, the tax arithmetic, the Pro plan) are laid onto flat earth fields of moss or clay with light ink floated on top.

The palette is a single earth family. Moss (#35422d) is the primary — the voice of action and of realized gain; fired clay (#694737) and terracotta (#ad7d62) are the warm secondaries that carry emphasis and drawn marks; dried-grass (#b9b28b) is a quiet highlight inside the dark fields; and a single earthy brick (#a2432a) is the one loss/alarm color on the trading board. There is no gold, no bevel, no glow, no gradient-as-decoration — the warmth comes from pigment and paper, not from shine. The result reads unmistakably even with content stripped: a grainy sand field, irregular paper sheets edged by warm hairlines, serif statements, and calm moss/clay basins of data.

The voice is blunt and the surface is tactile but quiet. Motion is a single 240ms interaction response; nothing floats far, nothing fades up in sequence. Source Serif 4 makes the statements and headings; Instrument Sans does all the reading, controls and — with tabular numerals — every market figure. The system has no monospace: precision is carried by tabular Instrument Sans, not by a code face.

**Key Characteristics:**
- Warm sand ground (#eee6d6) with a faint authored paper grain; lighter paper sheets (#f5eddf) carry dark-brown ink.
- One earth family: moss primary, fired-clay and terracotta secondaries, dried-grass highlight, brick for loss. No gold, no glow, no gradient.
- Irregular hand-cut corners via asymmetric border-radius on every sheet and control; no uniform radius.
- Data-dense sections sit on flat earth fields (moss basin, clay field, moss card) with light ink on top.
- Source Serif 4 for display/headings; Instrument Sans for reading, controls and tabular figures. No monospace.

## Colors

A single warm-earth family over sand paper: moss and clay do the colored work, brick is the one alarm, and everything structural is paper, stone and dark-brown ink.

### Primary
- **Moss** (#35422d): The primary voice — primary button fill, links, active/sorted states, focus ring, the LIVE blip, the watchlist star, realized-gain figures, and the full-bleed fields behind the tax arithmetic and the Pro plan. The color of action and of profit.

### Secondary
- **Fired Clay** (#694737): The deep warm emphasis — the highlighted phrase in the hero (`.hl`), link hover, and the flat field behind the honest "what it does / doesn't" ledger.
- **Terracotta** (#ad7d62): The art-accent — drawn marks (the hollow "doesn't" ring on the ledger) and warm decorative detail. Used sparingly as warmth, never as data.

### Tertiary
- **Dried Grass** (#b9b28b): A muted highlight used only inside the dark earth fields — the filled "does" mark on the ledger, emphasized terms in the moss formula, and the Pro-plan accents. The light-field counterpart to moss.

### Neutral
- **Sand Ground** (#eee6d6): The body background, carrying the faint paper grain; also the recessed ground inside the journal form and hovered table rows.
- **Paper Surface** (#f5eddf): The working sheets — cards, panels, the board frame, header, inputs, tooltips.
- **Stone (Surface-Muted)** (#ddd5c3): Table header bands, the footer band, and the ghost-button hover fill.
- **Dark-Brown Ink** (#29251d) / **Ink-Muted** (#443b2f): Headings and body ink, and the softer brown for subcopy, nav links and secondary figures.
- **Faint** (#6f6450): The quietest labels, captions, metadata and tax figures.
- **Warm Hairline** (#d9ceb7) / **Strong Hairline** (#c6b99d): The 1px structural lines — row rules and sheet edges, and the heavier stroke on input borders and control groups.
- **On-Field Ink** (#f1ead9) / **On-Field Muted** (#cdc2a4): The light paper-inks used for text sitting on the dark moss/clay fields (ledger, tax basin, Pro card, primary button).

### Loss
- **Brick** (#a2432a): The one alarm color — losses (`.neg`), the OFFLINE blip, the low-liquidity flag and its warning note, and form errors. Added to the earth family specifically for the trading board. Never decorative.

### Named Rules
**The One Earth Family Rule.** Every hue on the screen is sand, paper, stone, moss, clay, terracotta, dried-grass or brick. No color enters from outside the earth family — no blue, no gold, no purple, no status palette. Emphasis is bought with pigment weight (moss vs. clay) and with placing data on a flat field, not with a foreign accent.

**The Paper-and-Field Rule.** Dark-brown ink lives on paper; light on-field inks (#f1ead9 / #cdc2a4) live on the dark moss/clay fields. Text color is chosen by its ground, never mixed — never dark ink on moss, never light ink on paper.

## Typography

**Display / Heading Font:** Source Serif 4 (with Georgia, serif) — loaded on `--font-display`.
**Reading / Control / Figure Font:** Instrument Sans (with Helvetica Neue, sans-serif) — loaded on `--font-sans`.

**Character:** A serif-and-sans pair where the serif speaks and the sans works. Source Serif 4 carries headlines and statements at weight 600 with tight negative tracking, giving the worktable its calm editorial authority; Instrument Sans reads long copy at a generous 1.8 line-height and, with tabular numerals, renders every price, margin, ROI and volume as exact market data.

### Hierarchy
- **Display** (Source Serif 4 600, clamp(46px, 6vw, 70px), line-height 1.02, letter-spacing -0.02em): The landing hero headline; the emphasized phrase set in Fired Clay. Max ~15ch.
- **Headline** (Source Serif 4 600, clamp(1.9rem, 3.6vw, 2.6rem), line-height 1.05, letter-spacing -0.015em): Section headings and page heads.
- **Title** (Source Serif 4 600, ~1.25rem, line-height 1.18, letter-spacing -0.01em): Panel/column titles, plan tiers, the wordmark, and item stat values.
- **Body** (Instrument Sans 400, 16px base — 1.1rem for the hero lede, line-height 1.8): Prose and subcopy; constrained to ~56–58ch.
- **Figure** (Instrument Sans 400, ~0.94rem, tabular-nums, letter-spacing -0.01em): Every gp value, margin, ROI, price, volume and the tax formula (`.tnum` / `.mono`).
- **Label** (Instrument Sans 600, 12px metadata — 13px caption, letter-spacing 0, no transform): Field labels, table headers, the feed strip and metadata. Sentence case — never tracked-out caps.

### Named Rules
**The Serif-Statement Rule.** Source Serif 4 is reserved for statements — display, headlines, titles, stat values, the wordmark. Everything read or operated (body, controls, labels) is Instrument Sans. A heading is never set in the sans; running copy is never set in the serif.

**The Tabular-Not-Mono Rule.** The system has no monospace. Every market figure is Instrument Sans with `font-variant-numeric: tabular-nums` and a slight -0.01em tightening; figures never adopt a code face, and prose never borrows the tabular treatment.

## Layout

Centered single-column measure, max-width 1120px, 24px side padding (`--dp-spacing-content-gap`). Sections breathe at ~4.4rem vertical; the hero terminal runs tighter (3.4rem top). The landing signature is a three-piece stack reading as one worktable slab: a sans caption strip (top corners rounded 24px/20px only) sits flush atop the serif statement lede, which sits flush atop the live board (bottom corners taking the control radius) — joined by shared warm hairline edges so the seams disappear. Two-column grids (the honest ledger, the tax basin, pricing) collapse to a single column at 820px, with the dividing border rotating from a left edge to a top edge. The dense board sheds its optional columns (`.col-opt`) and tightens cell padding at 760px rather than only scrolling. Must hold down to 360px. Rhythm is in rem (roughly 0.7 / 1.3 / 2.1 / 2.8 / 4.4).

## Elevation & Depth

This system is nearly flat, with one faint resting lift. Paper sheets (cards, panels) carry a single soft shadow — `0 2px 10px rgba(41,37,29,0.06)` — reading as a sheet resting on the sand, not a floated card. The data fields (honest ledger, tax basin, Pro plan) are fully flat full-bleed earth, no shadow at all. Depth otherwise comes from the paper grain, the warm 1px hairlines, and a change of ground tone (sand #eee6d6 → paper #f5eddf → stone #ddd5c3). Shadows beyond the sheet-lift are functional only: a focus/validation ring on inputs and a soft cast under the transient chart tooltip.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 2px 10px rgba(41,37,29,0.06)`): Resting cards and panels — a faint paper lift, not a floating elevation. The only ambient shadow in the system.
- **Focus ring** (`box-shadow: 0 0 0 2px rgba(53,66,45,0.18)`, paired with a Moss border): Inputs and selects on focus — a focus affordance, not elevation.
- **Tooltip cast** (`box-shadow: 0 6px 18px rgba(41,37,29,0.14)`): The price-chart tooltip only — a transient overlay.

### Named Rules
**The Paper-Lift Rule.** A resting sheet gets at most the single faint paper lift (`0 2px 10px rgba(41,37,29,0.06)`); flat earth fields get none. No heavy grey drop-shadow, no stacked elevation layers. If two surfaces must read apart, change the ground tone or draw a warm hairline.

## Shapes

Hand-cut irregular corners are the signature. Every sheet and control uses an asymmetric four-value border-radius, never a uniform corner: sheets take `--dp-radius-sheet` (30px 22px 34px 20px / 24px 30px 22px 34px), controls (buttons, the board frame, notices, range toggles) take `--dp-radius-control` (27px 19px 29px 16px / 22px 26px 19px 29px), form inputs take a smaller irregular `16px 12px 18px 11px`, and small tags take `8px 5px 9px 4px`. Borders are structural and 1px — Warm Hairline (#d9ceb7) for row rules and sheet edges, Strong Hairline (#c6b99d) for input strokes and control groups. Drawn list marks are organic blobs, not glyphs: the "does" mark is a filled dried-grass pebble (`border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%`), the "doesn't" mark a hollow terracotta ring. Form language is soft, warm and irregular; there are no sharp 0-radius corners and no perfectly symmetric pills.

## Components

### Buttons
Softly rounded moss keys with organic corners; hierarchy from fill vs. hairline. All buttons are Instrument Sans 600, 14px, `--dp-radius-control`, `0.7rem 1.3rem` padding, 1px border, with a `scale(0.97)` press on `:active` and 0.5 opacity when disabled. Motion is 240ms ease and is disabled under `prefers-reduced-motion`.
- **Primary (`btn-gold`):** Solid Moss (#35422d) fill with On-Field (#f1ead9) ink — the one solid-color control. Hover deepens the fill to #40502f. (Class name is legacy; the fill is moss, not gold — see not-canonized.)
- **Ghost (secondary):** Transparent with a Strong-Hairline border and dark-brown ink. Hover fills with Stone (#ddd5c3) and shifts the border to Fired Clay.
- **Focus:** Global 2px solid Moss outline, 3px offset.

### Cards / Containers
- **Corner Style:** Irregular hand-cut sheet (`--dp-radius-sheet`).
- **Background:** Paper Surface (#f5eddf).
- **Shadow Strategy:** The single faint Sheet-Lift (`0 2px 10px rgba(41,37,29,0.06)`); flat earth-field panels (tax basin, Pro plan) carry none.
- **Border:** 1px Warm Hairline (#d9ceb7).
- **Internal Padding:** ~2.1rem; dense panels ~2.8rem.

### Inputs / Fields
- **Style:** Paper or sand ground, 1px Strong-Hairline border, irregular `16px 12px 18px 11px` radius, Instrument Sans (tabular for number fields).
- **Focus:** Border shifts to Moss with a `0 0 0 2px rgba(53,66,45,0.18)` moss ring; no glow.
- **Label:** Quiet Instrument Sans 600, 12px at letter-spacing 0 in Faint, stacked above the field. Error text brick (`.jf-err`), success text moss (`.jf-ok`).

### Navigation
- Sticky sheet-edge bar (64px), translucent sand (rgba(238,230,214,0.86)) with a 10px backdrop-blur and a 1px Strong-Hairline base. Links are Instrument Sans 500, 15px, in Ink-Muted; hover → Moss. Wordmark is Source Serif 4 600 in dark ink with a Moss mark.

### The Flip Board (signature)
The live table of flips, inside a hairline frame with control-radius corners (bottom-joined under the hero lede). Sticky header row on Stone (#ddd5c3) with quiet Faint sentence-case labels; sortable headers go Moss on hover and when active. Figures are right-aligned Instrument Sans tabular; the item name is the one left-aligned cell. Rows are ruled by 1px Warm Hairline and warm to Sand (#eee6d6) on hover. Tax is Faint, losses are brick. Thin/low-liquidity rows dim the item name to Faint and carry a brick flag. Members items carry a small moss "P" tag (`.mtag`) on the tag radius.

### Honest Ledger & Tax Basin (signature fields)
Two full-bleed flat earth fields. The honest "does / doesn't" ledger is one shared Fired-Clay (#694737) field with light on-field ink, split by a translucent light hairline, marked by drawn organic blobs (dried-grass filled, terracotta hollow). The tax arithmetic sits in a Moss (#35422d) basin with a darkened inset formula panel, emphasized terms in dried-grass. Both are flat — no shadow — and collapse to one column at 820px.

## Do's and Don'ts

### Do:
- **Do** keep the ground warm sand (#eee6d6) with the faint authored paper grain, and work on paper sheets (#f5eddf) in dark-brown ink (#29251d).
- **Do** spend color only within the earth family: moss primary, fired-clay/terracotta secondaries, dried-grass highlight, brick (#a2432a) for loss.
- **Do** put dark ink on paper and light on-field ink (#f1ead9) on the moss/clay fields — never mix the two (the Paper-and-Field Rule).
- **Do** cut every sheet and control with an irregular asymmetric radius; use the four established radius tokens, never a uniform corner.
- **Do** set statements/headings in Source Serif 4 600 and everything read/operated in Instrument Sans; render every figure in tabular Instrument Sans.
- **Do** keep sheets nearly flat — at most the single faint Sheet-Lift; flat earth fields get no shadow.

### Don't:
- **Don't** introduce a hue from outside the earth family — no blue, no gold, no purple, no status palette. Warmth comes from pigment and paper, not shine.
- **Don't** add gradients-as-decoration, bevels, inner-light modelling or glow; the surface is paper and pigment.
- **Don't** float a sheet on a heavy grey drop-shadow or stack elevation layers; separate surfaces with tone or a warm hairline.
- **Don't** use uniform or 0-radius corners, or symmetric pills; corners are hand-cut and irregular.
- **Don't** put an all-caps / tracked-out eyebrow or kicker above a heading; labels are quiet sentence-case Instrument Sans at letter-spacing 0.
- **Don't** reach for a monospace face for figures; precision is tabular Instrument Sans.

<!-- not canonized (pre-existing drift; nothing repaired — write boundary excludes web/): (1) globals.css carries legacy color/type aliases from prior worlds, now re-pointed into the earth family: --gold/--gold-2/--gold-deep alias onto moss/terracotta/clay, --green/--red onto --gain/--loss, --font-mono onto --font-sans, and the classes .btn-gold / .ink-gold / .mono persist. These are carried so older selectors keep resolving; they are drift, not sanctioned tokens — new work must not resurrect a literal "gold" or a mono face as a design device. (2) A legacy .eyebrow class survives (neutralized to text-transform:none, letter-spacing 0, faint); it is unused on the landing. The all-caps eyebrow/kicker is a craft-floor defect banned by AGENTS.md and PRODUCT.md and is recorded here as a carried defect, not a design device. The pricing .plan .rec badge uses uppercase + 0.08em tracking on the "recommended" tag — a localized tracked-caps label, not sanctioned as an eyebrow above headings. (3) The landing (page.tsx line 91) applies `.pos.lit` (full-charge profit, opacity 1 / weight 600) to every margin row rather than gating on real liquidity; the quiet-until-proven intent (.pos opacity 0.72 → .pos.lit) is the system, and that blanket application is a surface-level deviation. -->
