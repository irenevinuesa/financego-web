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
| **Navigation** | Four sections: **Technicals ▾** (Learn, Practice, 500 Challenge, Mock interview), **Behaviourals ▾** (Guide, Question library, Story bank, Mock interview), **Tools** and **Career**, with dropdowns on desktop and a grouped menu on mobile |
| **Home** | Hero, choose-your-path cards, a 500 Challenge band, featured courses, question of the day, live WACC→EV tool, interview challenge, progress preview, footer with legal pages |
| **Learn** | Catalogue of 50 courses in 8 categories with filters. **6 complete courses** (Finance 101, Accounting Fundamentals, Valuation Essentials: DCF, Trading Comparables, M&A Fundamentals, Fixed Income) with 30 lessons, KaTeX formulas, worked examples, **16 interactive widgets**, interview-mistake callouts, knowledge checks and final assessments. The other 44 courses are clearly marked *In development* with a planned outline |
| **Practice** | **500-question bank in 16 sections** (accounting, valuation, corporate finance, M&A, PE & LBO, capital markets, industries, restructuring, markets, fixed income, derivatives, macro, credit & risk, quant, brain teasers, consulting cases), each with its own page, progress and related lessons. Formats: multiple choice, numerical (with tolerance), open-ended (model answer and self-assessment), scenario, multi-step cases and interview traps. Filters by topic, difficulty, type, time, track and status. Six modes: Quick, Standard, Timed, Topic Mastery, Interview Prep and Review Incorrect |
| **500 Challenge** | All 500 questions in one fixed, mixed path: 10 stages of 50 with rising difficulty and no two consecutive questions from the same section. Answering a question (right or wrong) unlocks the next. A 500-square map, accuracy by stage and section, a recruiting date that sets a daily pace, and a missed list to repeat until each one is right |
| **Mock interviews** | **Technical** (28 scripted questions: technical, case, market and pitch) and **behavioural** (15 questions, opening with “Tell me about yourself” and closing with your questions), in **English and Spanish** for 9 tracks, with rule-based deeper or probing follow-ups, a timer, and a report covering accuracy or content, structure, numerical precision, clarity, model answers and suggested next steps |
| **Behaviourals** | A guide (what interviewers test, STAR, “Tell me about yourself”, why finance and why this firm, building a story bank, your questions, delivery), a library of 42 questions in 11 categories (what they look for, structure, pitfalls, an outline to adapt, likely follow-ups) and a STAR story bank saved in the browser, with category coverage |
| **Tools** | WACC Calculator, DCF Builder, Compound Interest, Bond Pricing. Each has validation, results, charts with a table view, interpretation, assumptions, formulas, reset and CSV export. Eight more tools are listed as planned |
| **Career** | 10 in-depth career guides (a typical day, team structure and seniority, groups or desks, skills, recruiting timeline, how pay is structured, pros and challenges, exits, how to stand out, glossary, reading and FAQs), CV and cover letter guide, networking templates, illustrative interview scenarios (clearly labelled as illustrative), 5 roadmaps and interactive checklists |
| **Other pages** | Dashboard (courses, practice, 500 Challenge, behaviourals), global search (⌘K and `/search`), settings with backup export, import and deletion, About, Help, Accounts (V2 notice), Privacy, Terms, Disclaimer and a 404 page |

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
  components/          UI by section (learn, practice, challenge, interview, behaviourals, tools, career…)
  content/             All course, question, interview and career content (typed TS data)
    courses/           finance-101.ts, accounting.ts, dcf.ts, trading-comps.ts, ma-fundamentals.ts,
                       fixed-income.ts, catalog.ts (planned courses)
    questions/         Practice bank (bank-core, bank-markets, bank-a, bank-b, bank-c: 500 questions)
    interview/         Bilingual interview scripts (items.ts technical, behavioural-items.ts)
    behaviourals/      Behavioural guide and question library
    practice-sections.ts  Intros, focus and lessons for each Practice section
    careers/           Guides and resources
  lib/
    finance/           Pure, unit-tested formulas (TVM, WACC, DCF, bonds, rates and credit, comps, M&A, compounding)
    store.ts           Local progress store (useSyncExternalStore + localStorage)
    progress.ts        Derived stats: streaks, skills, accuracy, goals
    interview.ts       Rule-based interview engine
    challenge.ts       500 Challenge order, stages, progress and pace
    practice.ts        Practice modes and filters
    search.ts          Local search index
scripts/build-patterns.mjs  Generates the contour-line pattern SVGs
```

### Adding content

- **A question:** add an object to `src/content/questions/bank-*.ts`. `npm test` validates its structure and links.
- **A lesson or course:** follow `src/content/courses/dcf.ts`, then register the course in `src/content/courses/index.ts` and remove it from `catalog.ts`.
- **An interview item:** add to `src/content/interview/items.ts` (technical) or `behavioural-items.ts`. Patterns are lower-case and accent-free regular expressions.
- **Keep the 500 Challenge at 500:** `content.test.ts` checks the total and the per-section targets. Adding a question means adjusting a target, and the challenge order changes.

## Suggested next steps (Version 2)

1. Supabase authentication and per-user storage (with row-level security), migrating the local store.
2. More complete courses, starting with the ones the new courses lead into (Precedent Transactions, Accretion / Dilution, Derivatives).
3. Adaptive difficulty and spaced repetition for the question bank.
4. The Tracker (applications, goals, calendar) back as an optional section; the code is in git history.
5. AI-assisted interview follow-ups and feedback behind a server-side API (never in client code), with usage limits and consent for storing answers.
6. Portfolio Analytics and Trading Comparables tools.
