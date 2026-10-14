# VibeFinance AI — UI Restyle Plan (Control Center design system)

Companion to `00-WIN-PLAN.md` and `01-TECH-PLAN.md`. This is the *visual layer + layout* plan for the
reference design. Content, copy, data and logic stay; only the skin and the shell change.

---

## 1. My read of the reference screen

What the image actually shows (so we replicate the *system*, not the pixels):

- A **black rounded device frame** (~36px radius) wrapping a **near-white canvas** (~28px radius). The frame
  visually "holds" everything — it reads as a premium app window, not a webpage.
- **Black top bar** (~56px): wordmark `Dei` + tiny green live dot + a 9px uppercase gray micro label
  `ADMIN`; a centred nav where **one item is an active pill** (`Control Center`, #2A2A2E, icon + 12px/600
  label) and the rest are muted 36px icon-only buttons; a **small black notch** hanging under the bar's
  centre; on the right a 32px initials avatar + name/email stack + chevron.
- **Left icon rail**: 40px circles, alternating black-fill/white-fill, then white 36px circles with one
  **count badge** (14px black dot, 8px white number) at the top-right of its icon.
- **Header**: 28px/800 title with an emoji, 11px muted subtitle, 40px white **search pill** right-aligned.
- **Stat row**: 4 equal ~88px cards, content centred — big 34px/800 number over an 11px label; fills in
  order **pastel blue → pastel green → transparent with a 1.5px dashed border → pastel yellow**; one card
  carries a decorative emoji in its top-right.
- **Section**: 13px/700 label + a small gray **count badge** + a white pill button on the right. Below it a
  **3-column grid** of ~150px cards: 28px circular icon badge top-right (green/pink/white), 17px/700 title,
  12px muted body, 11px meta row, and a pinned bottom row of a gray **status pill** + a cluster of 32–36px
  circles (neutral #F1F1F5 / primary black).
- **One lavender featured card** (`#E3C3F6`) — the most important item: white pill bottom-left, 36px black
  circle bottom-right, white 28px badge top-right. Exactly one per screen.
- **Floating black dock** pinned at the bottom of the main column, *overlapping* the cards, with five pastel
  circular buttons and a final `+` on #2A2A2E.
- **Right side panel** on a lighter surface: 20px/800 title + emoji, 11px subtitle, **segmented tabs on a
  #F1F1F5 track** (active = white + subtle shadow), then a vertical stack of **pastel cards** (blue, lilac,
  yellow repeating) with icon+category / date, 4-line body, and a bottom row of a white pill + three 24px
  ghost icon buttons (view/edit/delete). A final **dashed card peeks at the bottom edge** as an add state.
  The panel scrolls independently with a 4px thumb.

**Copy the system, never the content.** No `Dei`, no `ADMIN`, no `Control Center`, no `Ellington Thom`, no
courses/webinars/users, no `$296`, no `Anatomy and Physiology`. Every string we render must come from the
existing VibeFinance app (plus the small set of new strings the new features genuinely require).

Two things in the reference we should improve rather than copy verbatim:

1. **Muted contrast.** `#9A9AA5` on `#F7F7FB` is ≈ **2.6:1** — below WCAG AA. Use `#6B6B76` (≈ **4.9:1** on
   `#F7F7FB`) for any text that carries meaning (prices, dates, verdicts, metrics) and reserve `#9A9AA5` for
   purely decorative meta. Keep the *look* identical; adjust which token the meaningful labels use.
2. **Pastel = category coding, not decoration.** Give each of our own domains a fixed hue so the colour
   carries information: **blue = market/price**, **green = technical**, **lavender = fundamental/RAG**,
   **yellow = sentiment/flow**, **pink = alerts/breaches**, **lilac = portfolio/risk**, **neutral = neutral**.
   Then the layout reads as a system, not as wallpaper.

---

## 2. Token layer (single source of truth)

`src/styles/tokens.css` — every value from the design spec, as CSS custom properties on `:root`; nothing in
any component may contain a raw hex. Structure:

```css
:root{
  /* frame & surfaces */ --frame:#0B0B0D; --canvas:#F7F7FB; --panel:#FAFAFD; --surface:#FFFFFF;
  /* nav */ --nav-pill:#2A2A2E; --nav-icon:#8A8A94; --nav-icon-hover-bg:#1A1A1D;
  /* text */ --text-1:#111114; --text-2:#6B6B76; --text-3:#9A9AA5;   /* see §1.1 contrast note */
  /* lines */ --hairline:#ECECF2; --dashed:#C9C9D3; --soft:#F1F1F5; --soft-ink:#55555E;
  /* pastel */ --p-blue:#DCE9FB; --p-green:#D5F0CF; --p-yellow:#FDE8B5; --p-lav:#E3C3F6; --p-lilac:#E8D6F8; --p-pink:#FBD6DD;
  /* states */ --live:#3DDC84; --ok:#D5F0CF; --bad:#FDE0E0; --bad-ink:#D64545;
  /* avatar */ --avatar-bg:#E9D5FF; --avatar-ink:#5B21B6;
  /* radii */ --r-frame:36px; --r-canvas:28px; --r-card:24px; --r-stat:22px; --r-panel:20px; --r-pill:999px;
  /* elevation */ --sh-card:0 1px 2px rgba(0,0,0,.04); --sh-tab:0 1px 3px rgba(0,0,0,.08); --sh-dock:0 12px 30px rgba(0,0,0,.25);
  /* space */ --s1:8px; --s2:16px; --s3:24px;  --pad-canvas:24px; --pad-card:18px; --pad-panel:14px;
  /* type */ --font:'Plus Jakarta Sans',Inter,system-ui,sans-serif;
}
[data-theme="dark"]{ /* optional inversion for the "trading terminal" feel — swap surface/canvas/text tokens only */ }
@media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important; transform:none !important; } }
```

Type scale, radii, spacing, icon sizes (Lucide at 1.75px stroke) and the interaction states from the spec go
into `src/styles/base.css` as utility classes (`t-title`, `t-stat`, `t-cardTitle`, `t-panelTitle`,
`t-label`, `t-body`, `t-meta`, `t-pill`, `t-micro`) so components stay token-only.

**Font change:** `index.html` currently loads Inter + Outfit + Space Grotesk + JetBrains Mono (four families,
~4 network requests). Replace with **Plus Jakarta Sans 400/500/600/700/800** only, and get numeric alignment
from `font-variant-numeric: tabular-nums` instead of a mono family. That is faster *and* on-spec.

---

## 3. Component tree to build

```
src/styles/{tokens.css, base.css}
src/components/ui/
  AppFrame.jsx        black 36px shell + 28px canvas + notch + footer strip
  TopNav.jsx          wordmark + live dot + micro label | centre icon nav (active pill) | avatar cluster + chevron
  IconRail.jsx        40px circles (top group alternate black/white) + 36px bottom group + 1 count badge
  PageHeader.jsx      title + emoji + 11px subtitle + SearchPill slot
  SearchPill.jsx      40px, 1px hairline, ~240px, icon + placeholder  (wired to /api/corpus/search)
  StatCard.jsx        variants: blue | green | dashed | yellow ; optional decorative icon
  SectionHeader.jsx   label + count badge + right pill button
  ContentCard.jsx     28px badge, title, 12px body, meta row, status pill, action cluster
  FeaturedCard.jsx    lavender, white pill + black circle + white badge (used once: the verdict)
  Pill.jsx            soft/gray/white/pastel variants
  IconButton.jsx      colour + size variants, mandatory aria-label prop
  SegmentedTabs.jsx   #F1F1F5 track, white active with --sh-tab, 150ms fade
  SidePanel.jsx       title + subtitle + tabs + independently scrolling stack + dashed add card
  SidePanelCard.jsx   pastel fills, icon+category + date, 4-line body, white pill + 3 ghost icon buttons
  Dock.jsx            floating black pill, 5 pastel circles + "+", overlaps content
  Modal.jsx           restyled modal primitive (white, 24px, hairline, ESC + focus trap)
```

Then `src/screens/ControlCenter.jsx` composes the shell; the existing feature components
(`StockHeader`, `ConsensusDecision`, `CandlestickChart`, `AgentPanel`, `PerformanceTelemetry`,
`DocumentCitationModal`, `ArchitectureModal`) are **refactored to render through these primitives** rather
than rewritten — their props, state and data bindings stay exactly as they are today.

---

## 4. Content → component mapping (per existing section, nothing invented)

### Shell

| Reference element | Our content (source) | Notes |
|---|---|---|
| Wordmark + green dot + micro label | `.brand-title` + `.brand-subtitle` (Navbar.jsx) | Label = existing `NSE LIVE` + `NIFTY 50 24,862.15 +0.48%` as the 9px micro label |
| Centre icon nav (active pill + icon-only) | the 5 existing sections | Tabs: **Decision · Signals · Swarm · Evidence · Portfolio**. Active = pill with icon + label; others icon-only. This is the same content, navigated — no new features |
| Notch below the bar | — | pure decoration via a TopNav `::after` |
| Avatar + name + email + chevron | `.user-badge` (`IS`, `Ishita Singh`, `Team SHAKTI`) | chevron opens the existing action set (Degraded toggle, Citations, Architecture) for the responsive case |
| Left rail top group | `.btn-refresh-agents` (Re-Run Swarm) + degraded toggle | black circle = run, white = degraded (black when active) |
| Left rail count badge | `.citation-badge` value | the badge lives on the Citations circle |
| Left rail bottom group | Architecture, Audit-pack download, Stock picker, Citations | 36px white circles |
| Dock | Re-Run · Degraded · Citations · Architecture · Audit pack + `+` (switch security) | pastel blue/lavender/pink/yellow/green + `#2A2A2E` plus |

### Main column, tab by tab

| Tab | PageHeader title / subtitle (existing strings) | StatCards (4) | Body |
|---|---|---|---|
| **Decision** (default) | `Unified Multi-Agent Decision Engine` / existing tagline | Consensus Score · Consolidated Confidence · End-to-end Latency · Evidence Coverage (blue/green/dashed/yellow) | **FeaturedCard** = the verdict (badge, score, targets, action summary, conflict banner, coverage meter) + SectionHeader `Portfolio Impact` + 2–3 ContentCards (breach, stress test, alternative) |
| **Signals** | `{SYMBOL} Price Action & Indicators` / `Daily Candlesticks • 50/200 DMA • Volume Anomaly Overlay` | RSI(14) · MACD Histogram · Volume vs 20d · Bollinger %B | the chart in a white ContentCard; the existing `All Indicators / RSI / MACD` buttons become **SegmentedTabs**; the hover tooltip bar stays |
| **Swarm** | `Tri-Agent Autonomous Consensus Swarm` / `Three specialized autonomous agents running in parallel…` | per-agent latency ×3 + Parallel status (dashed) | SectionHeader with count badge `3` and the pill button `Parallel Asynchronous Execution` (existing string); one **ContentCard per agent** — see below |
| **Evidence** | `Verified Regulatory Citations (RAG Retrieval)` / existing modal subtitle | Claims · Verified · Coverage % · Unsupported | SectionHeader count badge = citations count; one ContentCard per citation + the verification ledger rows (`NUMERIC MATCH ✓`) |
| **Portfolio** (new content, MVP-required) | `Portfolio & Risk` / holdings summary | HHI · Sector max · Beta-weighted · Stress −3% | holdings as ContentCards (weight, P&L, sector pill) + risk Cards + watchlist |

### Agent ContentCard anatomy (maps `AgentPanel.jsx` 1:1)

| Slot | Existing content |
|---|---|
| 28px badge top-right | pastel **green** when `HEALTHY`, pastel **pink** when `DEGRADED*` |
| Title 17/700 | `agentName` |
| Description 12/400, 3 lines + expand | `reasoning` (line-clamped, "Read full chain" expands) |
| Meta row 11/500 | `executionTimeMs` • `confidence%` • the agent's own metric chips (RSI / Volume Surge / Anomaly Flag, etc.) |
| Bottom-left status pill | `status` with an emoji (`✅ HEALTHY` / `⚠️ DEGRADED_RAG_FALLBACK`) |
| Bottom-right action cluster | neutral circle = expand, primary black circle = `Inspect Source Citations (n)` (A2) / re-run (A1, A3) |

### Side panel (persistent, 260px, 3 segmented tabs)

| Tab | Panel title/subtitle (existing) | SidePanelCards (pastel) |
|---|---|---|
| **Profile** | `Personalized Investor Profiling` / `Identical market input produces tailored risk-weighted execution` | 3 persona cards (blue Conservative / lilac Balanced / yellow Aggressive) each with name, description, the existing `Fund/Tech/Sent` weight row as the white pill, and the `Active` state; plus the behavioural-tilt card; final **dashed** card = the empty/add state |
| **Session** | `Session Telemetry & Evaluation Metrics` / `LIVE MONITOR` | the 3 existing metric pills as pastel cards (latency / 30d accuracy / risk concentration) + the terminal log lines as one card |
| **Status** | `Data Provenance & System Status` | one pastel card per source (price / volume / filings / news / options) with freshness + `LIVE`/`DELAYED`/`UNAVAILABLE`, and the degradation mitigations when active |

The segmented-tab switch is a 150ms fade; the side panel scrolls independently with the 4px `#D9D9E3` thumb.

---

## 5. Interaction, states and accessibility (from the spec, made implementable)

- Hover on every card/stat/dock button: `translateY(-2px)`, 150ms ease (disabled under
  `prefers-reduced-motion`).
- Primary buttons hover → `#1A1A1D`; positive icon buttons hover → `--ok`; destructive → `--bad`/`--bad-ink`.
- Focus ring: `outline: 2px solid var(--text-1); outline-offset: 2px` on **all** interactive elements.
- Disabled: 40% opacity, no motion.
- **Every icon-only button gets an `aria-label`** (today none have one) and every card action cluster is a
  real `<button>`.
- Fix the existing a11y defects while we are in here: the persona cards (`ConsensusDecision.jsx:100`) become
  `<button>`s in a `role="radiogroup"`; modals gain ESC-to-close, a focus trap and `aria-modal`; the chip
  grids become definition lists; the chart gets a text summary for screen readers.
- Responsive: ≥1280px full 3-region layout · 768–1279px side panel drops below the main column, content grid
  2 columns, stat cards 2×2 · <768px single column, rail becomes a bottom bar, nav collapses into a menu
  button, stat cards 2×2, dock pinned with safe-area padding.

---

## 6. Build order (fits Blocks 0–1 of the sprint, ≈4 hours of one person's time)

1. **Tokens + base + AppFrame + TopNav + IconRail** — the whole app changes personality at once, and every
   later block inherits it.
2. **PageHeader + SegmentedTabs + StatCard row** — the top of the page now matches the reference exactly.
3. **ContentCard + SectionHeader + Pill + IconButton** — convert `AgentPanel` (3 cards) and the citation
   list; delete the old `.glass-panel` styling as sections migrate (no dead CSS left behind).
4. **FeaturedCard** — convert `ConsensusDecision`'s verdict card; put the persona cards in the side panel.
5. **SidePanel + SidePanelCard** — the 3-tab panel, then move `PerformanceTelemetry` metrics and the
   provenance list into it.
6. **Dock** — floating pill, `z-index` above the cards, overlapping the last row (this is the detail that
   makes people say "that's the design").
7. **Modal** — restyle both modals; swap `Cryptographically Grounded` for the real verification badge
   (`NUMERIC MATCH ✓ · span 412-561 · RIL_SEBI_Q1FY25#104`) — this is required by the honesty pass in
   `00-WIN-PLAN.md` §7, not a style choice.
8. **Chart card** + fix the broken volume render (bars currently paint as full-height dark boxes behind the
   candles).
9. **a11y + responsive pass + reduced-motion pass.**

Each step ends with `npx oxlint` clean, `vite build` green and a screenshot in the Preview tab.

---

## 7. Acceptance checklist (a judge should be able to tick these in 10 seconds)

- [ ] Black 36px frame, 28px light canvas, black 56px top bar with a notch, centred nav with exactly one
      active pill, avatar cluster on the right.
- [ ] Left rail with alternating black/white 40px circles and one count badge; floating black dock with five
      pastel circles + `+`, overlapping the content.
- [ ] Four stat cards in the exact fills blue / green / **dashed** / yellow, 34px numbers over 11px labels.
- [ ] Exactly **one** lavender featured card, with a white pill, a 36px black circle and a white badge.
- [ ] 3-column content grid, 24px radius, 28px pastel/pink icon badges, status pill + action cluster pinned
      bottom.
- [ ] Right side panel on `#FAFAFD` with segmented tabs (white active), pastel cards, a dashed card peeking
      at the bottom, and an independent 4px scrollbar.
- [ ] Plus Jakarta Sans, no raw hex in components, tokens referenced everywhere.
- [ ] No content, numbers or names from the reference image anywhere in the app.
- [ ] Every icon-only button has an `aria-label`; keyboard-only users can reach every control; the app is
      usable at 375px, 768px and 1440px.
- [ ] The dark glassmorphism styling is fully gone (or, if we keep it, it is a documented `[data-theme=dark]`
      token swap, not a second stylesheet).

---

## 8. How to verify visually (no guessing)

`npm ci && npx vite dev --host 127.0.0.1 --port 5173` → open in the Preview tab → screenshot at
**1440×900, 1024×768 and 390×844**, and diff each against the reference for: frame radius, nav pill, dashed
stat card position, featured card colour, dock overlap, side-panel tab track. Keep the three screenshots in
`docs/screenshots/` and link them from the README — proof of the design for the judges, and a regression
baseline for us.
