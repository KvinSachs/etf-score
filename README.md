# ETF Score

**ETF portfolio diversification analyzer with expert multi-criteria scoring.**

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

- **Expert scoring /20** across 5 dimensions: geography, sectors, overlap, asset classes, currencies
- **ETF overlap detection** — flags redundant positions
- **Contextual recommendations** split into essential alerts and advanced analysis
- **Suggestion sheets** — curated ETF options per category with TER, PEA eligibility and popularity tags
- **Investment plan** per ETF — recurring amount tracker with frequency and start date
- **Onboarding flow** — 3-step carousel with inline portfolio setup
- **Splash screen + bottom tab bar** — native app feel
- **Auto-save** via localStorage
- **PWA** — installable from Safari/Chrome, works offline
- **40+ ETFs** in database including major European, PEA-eligible and thematic funds

## ETF Database

Covers major ETFs available to European investors: IWDA, VWCE, MWRD, EWLD, PAEEM, EIMI, CSP1, VUAA, PANX, PUST, VEUR, MEUD, PCEU, EXSA, EPRA, CBRE, SGLD, AGGH, IEAG, VAGF, IUSN, RS2K, PTPXE, PAEMF and more.

## Disclaimer

ETF compositions are approximate and based on data available at build time. They may differ from actual current compositions. This tool does not constitute investment advice under AMF regulations.
