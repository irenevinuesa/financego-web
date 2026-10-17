# FinanceGo

**Learn Finance. Think Bigger. Go Further.**

FinanceGo is an interactive finance education and career-preparation platform for university students and young analysts. This repository contains **Version 1 (MVP)**: a fully static site with no accounts, no paid services and no server. Learner data is stored in the browser.

## Run it locally

FinanceGo needs Node.js 20.9 or newer. On this Mac, Node 24 LTS is installed in `~/.local/node`, which is not on your PATH yet, so first run:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

(To make that permanent, add the same line to `~/.zshrc`.) Then, from this folder:

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (already done) |
| `npm run dev` | Development server at http://localhost:3000 |
| `npm test` | Unit tests: finance formulas, parsing, interview engine, content integrity |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build, exported as static files to `out/` |
| `npm run preview` | Serve `out/` at http://localhost:4173 (uses Python's built-in server) |
| `npm run patterns` | Regenerate the contour-line patterns in `public/patterns/` |

To deploy, upload the `out/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages…).

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Recharts · KaTeX · Lucide icons · Vitest.

## What works in V1

| Area | Built |
| --- | --- |
| **Design system** | Palette built on the FG logo blue (#114779), DM Serif Display, Inter, JetBrains Mono and Caveat (handwritten notes); no photography: covers in the logo blues with original topographic contour-line patterns, the FG monogram and category icons; chart palette checked for colour-blind safety |
| **Home** | Hero, choose-your-path cards, featured courses, question of the day, live WACC→EV tool, interview challenge, progress preview, footer with legal pages |
| **Learn** | Catalogue of 50 courses in 8 categories with filters. **6 complete courses** (Finance 101, Accounting Fundamentals, Valuation Essentials: DCF, Trading Comparables, M&A Fundamentals, Fixed Income) with 30 lessons, KaTeX formulas, worked examples, **16 interactive widgets**, interview-mistake callouts, knowledge checks and final assessments. The other 44 courses are clearly marked *In development* with a planned outline |
| **Practice** | 82-question bank across 13 topics: multiple choice, numerical (with tolerance), open-ended (model answer and self-assessment), scenario, multi-step cases and interview traps. Filters by topic, difficulty, type, time, track and status. Six modes: Quick, Standard, Timed, Topic Mastery, Interview Prep and Review Incorrect |
| **Interview Simulator** | 30 scripted questions in **English and Spanish** for 9 tracks and 5 formats, with rule-based deeper or probing follow-ups, a timer, and a report covering technical accuracy, structure, numerical precision, clarity, model answers, suggested lessons and practice |
| **Tools** | WACC Calculator, DCF Builder, Compound Interest, Bond Pricing. Each has validation, results, charts with a table view, interpretation, assumptions, formulas, reset and CSV export. Eight more tools are listed as planned |
| **Tracker** | KPIs, course progress and milestones, study time, skills radar (built only from real answers), accuracy by topic and difficulty, frequently missed questions, interview history, pipeline and calendar. Application tracker with table and Kanban views (drag and drop), filters and sorting. Goals that update automatically |
| **Career** | 10 career guides, CV and cover letter guide, networking templates, illustrative interview scenarios (clearly labelled as illustrative), 5 roadmaps and interactive checklists |
| **Other pages** | Dashboard, global search (⌘K and `/search`), settings with backup export, import and deletion, About, Help, Accounts (V2 notice), Privacy, Terms, Disclaimer and a 404 page |

## Honest limitations

- **No accounts.** Progress lives in `localStorage` (`financego:v1`). Clearing browser data deletes it, and the UI says so everywhere data is saved. A backup can be exported and imported in Settings.
- **Interview feedback is rule-based** (concept patterns, numeric tolerance, length and structure heuristics). It does not understand language, and the report says so.
- **Open-ended practice answers are self-assessed** against key points, not graded.
- **Contact channel:** set `contactEmail` in `src/content/site.ts` to show a contact address on the Help page.
- **Graphics:** covers are CSS gradients plus contour-line SVG masks (`src/components/art/Cover.tsx`, patterns from `npm run patterns`). The logo source is in `assets/brand/`.

## Project structure

```
src/
  app/                 Routes (one folder per page)
  components/          UI by section (learn, practice, interview, tools, tracker, career…)
  content/             All course, question, interview and career content (typed TS data)
    courses/           finance-101.ts, accounting.ts, dcf.ts, trading-comps.ts, ma-fundamentals.ts,
                       fixed-income.ts, catalog.ts (planned courses)
    questions/         Practice bank
    interview/items.ts Bilingual interview scripts
    careers/           Guides and resources
  lib/
    finance/           Pure, unit-tested formulas (TVM, WACC, DCF, bonds, rates and credit, comps, M&A, compounding)
    store.ts           Local progress store (useSyncExternalStore + localStorage)
    progress.ts        Derived stats: streaks, skills, accuracy, goals
    interview.ts       Rule-based interview engine
    practice.ts        Practice modes and filters
    search.ts          Local search index
scripts/build-patterns.mjs  Generates the contour-line pattern SVGs
```

### Adding content

- **A question:** add an object to `src/content/questions/bank-*.ts`. `npm test` validates its structure and links.
- **A lesson or course:** follow `src/content/courses/dcf.ts`, then register the course in `src/content/courses/index.ts` and remove it from `catalog.ts`.
- **An interview item:** add to `src/content/interview/items.ts`. Patterns are lower-case and accent-free regular expressions.

## Suggested next steps (Version 2)

1. Supabase authentication and per-user storage (with row-level security), migrating the local store.
2. More complete courses, starting with the ones the new courses lead into (Precedent Transactions, Accretion / Dilution, Derivatives).
3. A larger question bank with adaptive difficulty.
4. AI-assisted interview follow-ups and feedback behind a server-side API (never in client code), with usage limits and consent for storing answers.
5. Portfolio Analytics and Trading Comparables tools.
