# AGENTS.md — Read this before building anything

You are building a website in this folder. Before writing or editing any file,
read this whole document and follow it in order. These rules apply to every
task in this project, however small.

---

## 0. Required skills

This project depends on four skill sets. Check that each one is installed
before doing any work. If one is missing, stop and tell the user which
command to run. Do not continue without them.

| Skill set | Purpose | Install (run from project root) |
|---|---|---|
| **Impeccable** | Design vocabulary, design direction, critique, polish | `npx impeccable install` then `/impeccable init` |
| **Transitions.dev** | Crafted UI transitions (modals, dropdowns, tabs, tooltips, hovers, loaders) | `npx skills add Jakubantalik/transitions.dev` |
| **GSAP (official)** | Scroll animation, pinning, parallax, timelines | `npx skills add https://github.com/greensock/gsap-skills` |
| **Make Interfaces Feel Better** | Shadows, spacing, radius, hover states, hit areas, details | `npx skills add jakubkrehel/make-interfaces-feel-better` |

Note: Impeccable requires Node 22.12 or newer.

---

## 1. Order of work (always follow this sequence)

### Step 1 — Context first (Impeccable)
- Load project context. If `PRODUCT.md` is missing or empty, run
  `/impeccable init` and ask the user about the product, audience and goal.
  Never invent PRODUCT.md from the first prompt alone.
- If `DESIGN.md` exists, its rules win over your own taste.
- If it does not exist, create it with `/impeccable document` once the first
  page has a direction.

### Step 2 — Shape before code (Impeccable)
- For any new page or section, run `/impeccable shape` and wait for the user
  to confirm the brief before writing code.
- Decide colors, type, spacing scale and layout in DESIGN.md first. Use those
  tokens everywhere. No hard-coded one-off values.

### Step 3 — Build the static page
- Build structure, content and layout with no animation yet.
- Responsive down to 360px wide. Visible keyboard focus. Good contrast.

### Step 4 — Motion (pick the right tool)
Use exactly one tool per job. Do not mix them on the same element.

| Job | Tool |
|---|---|
| UI state change: open/close, hover, tabs, tooltip, modal, dropdown, accordion, success/error, skeleton | **transitions-dev** (CSS, `t-*` classes, motion tokens) |
| Scroll-linked motion: reveal on scroll, pinning, scrub, parallax, horizontal scroll sections | **gsap-scrolltrigger** |
| Multi-step sequences, page-load intro | **gsap-timeline** + **gsap-core** |
| React / Next.js components using GSAP | **gsap-react** (always clean up on unmount) |
| Smooth scroll, scroll-to, Flip, other plugins | **gsap-plugins** |

Motion rules:
- One orchestrated "wow" moment per page beats effects on every section.
- Animate only `transform` and `opacity` where possible. Never animate
  layout properties (`width`, `height`, `top`, `left`) or `mask-position`.
- Pinning and parallax: test at mobile size. Call `ScrollTrigger.refresh()`
  after images and fonts load.
- Respect `prefers-reduced-motion` for both CSS transitions and GSAP
  (use `gsap.matchMedia()` for GSAP).
- Use transitions.dev motion tokens for durations and easings. No random
  `300ms ease` values.

### Step 5 — Polish (Make Interfaces Feel Better + Impeccable)
1. Run `/make-interfaces-feel-better` on every finished component:
   concentric border radius, shadows for elevation and borders for structure,
   hover/active/focus states, hit areas, optical alignment, icon states.
2. Run `transitions-polish` (`transitions review`) to align all motion to
   the token scale.
3. Run `/impeccable critique` then `/impeccable polish`.
4. Run `npx impeccable detect` and fix every finding.

---

## 2. Hard rules

- Never skip Step 1 or Step 2, even for "quick" changes.
- Never ship the generic AI look: purple gradients, identical rounded cards
  with the same grey shadow, all-caps eyebrow labels above every heading,
  bounce easing, fade-up on every section.
- Every interactive element needs hover, active, focus and disabled states.
- Spacing comes from the spacing scale in DESIGN.md only.
- Real content over lorem ipsum. Ask the user if content is missing.
- If two skills give conflicting advice, follow this priority:
  **DESIGN.md > Impeccable > Make Interfaces Feel Better > transitions-dev > GSAP defaults.**

---

## 3. Done checklist (report this at the end of every task)

- [ ] PRODUCT.md and DESIGN.md exist and were followed
- [ ] Brief was confirmed with `/impeccable shape`
- [ ] Each animation uses the correct tool from the Step 4 table
- [ ] Reduced motion works
- [ ] Hover / active / focus states on all interactive elements
- [ ] Polish pass done (make-interfaces-feel-better, transitions review, impeccable polish)
- [ ] `npx impeccable detect` shows no issues
- [ ] Checked at mobile, tablet and desktop widths
