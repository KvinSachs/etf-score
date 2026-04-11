# ETF Score

**ETF portfolio diversification analyzer with expert multi-criteria scoring and DCA optimization.**

Built with Claude (Anthropic) — transparent about the process, fully functional in production.

> ⚠️ For informational purposes only. Not investment advice.

---

## Stack

- React 18 + Vite
- PWA — installable on iOS & Android
- localStorage for persistence (no backend, no account)

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **New Project** → import the repo
4. Framework preset: **Vite**
5. Click **Deploy** — done ✓

## Features

### Scoring
- **Expert scoring /20** across 5 dimensions: geography, sectors, overlap, asset classes, currencies
- **ETF overlap detection** — flags redundant positions
- **Contextual recommendations** split into essential alerts and advanced analysis
- **Suggestion sheets** — curated ETF options per category with TER, PEA eligibility and popularity tags
- **3D donut charts** — geographical and sector breakdown with gap segments

### DCA Planning & Optimization
- **Investment plan** per ETF — recurring contributions with weekly/monthly/quarterly frequency
- **DCA projection** — simulates portfolio score at 1 year and 5 years based on current plan
- **DCA optimizer** — gradient ascent algorithm redistributes fixed monthly budget across holdings to maximize projected score at 5 years, with allocation constraints (emerging markets ≤25%, North America ≤75%, equity ≤90%, bonds ≤50%, commodities ≤15%, real estate ≤20%)
- **Apply scenario** — one-tap confirmation modal to update all recurring orders at once

### UX & Mobile
- **Swipe-to-delete** with 3s undo toast on ETF positions
- **Bottom sheets** — full-height, drag-to-close with scroll conflict prevention and pull-to-refresh blocking
- **Onboarding flow** — 3-step carousel with inline portfolio setup, auto-focus keyboard on iOS PWA
- **Welcome screen** — confetti animation after first portfolio setup
- **Swipe hint** — animated demo on first launch (mobile only)
- **Context menu** — right-click delete on desktop

### Design
- **Liquid glass tab bar** — frosted pill with iridescent prismatic layer, directional inset borders on active tab, and arc glow + lens zoom on tap
- **Dark / light theme** — with a gag screen on light mode activation
- **WCAG AA compliant** — all text passes contrast requirements
- **PWA icons** — 512, 192, 180, 152px

## ETF Database

Covers major ETFs available to European investors: IWDA, VWCE, MWRD, EWLD, PAEEM, EIMI, CSP1, VUAA, PANX, PUST, VEUR, MEUD, PCEU, EXSA, EPRA, CBRE, SGLD, AGGH, IEAG, VAGF, IUSN, RS2K, PTPXE, PAEMF and more.

## Disclaimer

ETF compositions are approximate and based on data available at build time. They may differ from actual current compositions. This tool does not constitute investment advice under AMF regulations.
