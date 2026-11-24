# FinanceGo

**Learn Finance. Think Bigger. Go Further.** · *Aprende finanzas. Piensa en grande. Llega más lejos.*

FinanceGo is an interactive finance education and interview-preparation website for university students and young analysts, in **English and Spanish**. It is a fully static site: no accounts, no server and no paid services. Learner data is stored in the browser, and market headlines are refreshed every morning at 9:00 (Madrid time).

Contact: infofinancego@gmail.com

## Run it locally

FinanceGo needs Node.js 20.9 or newer. On this Mac, Node 24 LTS is installed in `~/.local/node`, which is not on your PATH yet, so first run:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

(To make that permanent, add the same line to `~/.zshrc`.) Then, from this folder:

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Development server at http://localhost:3000 (redirects to `/en/` or `/es/`) |
| `npm test` | Unit tests: finance formulas, parsing, planner, news, content integrity |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build, exported as static files to `out/` (fetches today's headlines) |
| `npm run preview` | Serve `out/` at http://localhost:4173 (uses Python's built-in server) |
| `npm run patterns` | Regenerate the contour-line patterns in `public/patterns/` |
| `npm run og-image` | Regenerate `public/og-image.png`, the preview shown when a link is shared |

## What is on the site

| Section | What it does |
| --- | --- |
| **Technicals** | **Learn**: 6 complete courses (30 lessons with formulas, worked examples, 16 interactive widgets, knowledge checks and assessments) and 44 more listed as in development. **Practice**: 500 questions in 16 sections, five formats, six modes. **500 Challenge**: all 500 questions in one path that unlocks as you go. **Mock interview**: 50 short numeric questions in five levels, each with its own time limit, graded right or wrong; 7/10 unlocks the next level |
| **Behaviourals** | A guide to behavioural interviews (STAR, your pitch, why finance), a library of 42 questions in 11 categories and a STAR story bank |
| **Brain Teasers** | 43 puzzles in six categories (probability, expected value, mental maths, logic, sequences, estimation) with hints, worked solutions and answer checking |
| **Tools** | 12 working tools: WACC, DCF, Compound Interest, Bond Pricing, Paper LBO, Accretion / Dilution, Trading Comps, Investment Return, Option Pricing (Black–Scholes), Break-even and Portfolio Risk & Return. Each has validation, results, interpretation, assumptions, formulas and CSV export |
| **News** | Market headlines from the FT, CNBC, Investing.com, the Fed, the ECB and the Bank of England, from 00:00 yesterday to the latest update, each linked to the FinanceGo concept behind it (see below) |
| **Planner** | Enter an interview date, role, study days and daily time (15 min to 8 h); get a day-by-day calendar of lessons, practice, the 500 Challenge, mock interview levels, brain teasers and behavioural prep, with tasks to tick and an `.ics` export |
| **Career** | 10 in-depth career guides, CV and cover letter guide, networking templates, interview scenarios, roadmaps and checklists |
| **Dashboard** | Today's tasks from your plan, course progress, practice accuracy, streak, 500 Challenge, mock interview levels, brain teasers solved, stories and recent activity |
| **Other** | Global search (⌘K), settings with backup export/import and deletion, About, Help, Privacy Policy, Terms, Educational disclaimer |

## Languages (EN / ES)

- Every page lives under `/en/…` and `/es/…` (`src/app/[lang]/`). `/` sends visitors to their browser's language (on Vercel via `vercel.json`, otherwise with a small script). The globe button in the header switches to the same page in the other language.
- Translated into Spanish: menus, header and footer, home, the Technicals / Behaviourals / Tools hubs, the behavioural guide, Mock interview, Brain Teasers, News, Planner, Dashboard, Settings, Help, About and the legal pages.
- Still in English (a notice says so on Spanish pages): course lessons, the 500 practice questions, career guides and the tools' own calculators.
- How to translate a component: Server Components call `getLang()` (`src/lib/server-lang.ts`, built on `next/root-params`); Client Components call `useLang()` (`src/components/i18n/LangProvider.tsx`). Text lives in a small `{ en, es }` dictionary next to the component. Always import `Link` from `@/components/i18n/Link`, which adds the language to every internal link. When a section is translated, add it to `src/components/i18n/EnglishOnlyNotice.tsx`.

## Deployment (Vercel) and the 9:00 news update

The site is a static export (`output: "export"`), hosted on **Vercel** from the private GitHub repository.

1. In Vercel, import the GitHub repository (framework: Next.js; `vercel.json` sets the build and the `/` language redirect). Every push to `main` deploys.
2. In **Project → Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to the site's address (e.g. `https://financego.vercel.app`, or your own domain). It is used for the sitemap and social previews.
3. **Daily news at 9:00:** headlines are fetched when the site is built. `.github/workflows/daily-news.yml` asks Vercel to rebuild every morning at 9:00 Madrid time. Create a deploy hook in **Vercel → Project → Settings → Git → Deploy Hooks** (branch `main`) and save its URL as the GitHub Actions secret `VERCEL_DEPLOY_HOOK`. GitHub schedules in UTC, so the workflow has two schedules (07:00 and 08:00 UTC) and a gate that lets through only the one that is 9:00 in Madrid in the current season; GitHub may start scheduled runs a few minutes late.
4. `.github/workflows/ci.yml` type-checks and tests every push.

`src/lib/base-path.ts` and `NEXT_PUBLIC_BASE_PATH` let the site run under a sub-path (e.g. GitHub Pages); on Vercel it is empty.

## Search engines and sharing

- `src/app/sitemap.ts` lists every public page in both languages with `hreflang` alternates; `src/app/robots.ts` keeps personal pages (dashboard, settings, sessions, search) out of the index.
- Each language has its own title and description; `public/og-image.png` is the preview image for LinkedIn, WhatsApp and others.

## Privacy and data

- **No accounts.** Progress lives in the browser's `localStorage` (`financego:v1`): lessons, answers, the 500 Challenge, mock interview scores, brain teasers, plans, stories and an optional first name. It is never sent anywhere. Clearing browser data deletes it; Settings can export and import a backup.
- The only server-side processing is Vercel's own request logs. The Privacy Policy (`/privacy/`) explains this, and requests go to infofinancego@gmail.com.

## Honest limitations

- Progress does not sync across devices (no accounts yet).
- Open-ended practice answers are self-assessed against key points, not graded.
- News headlines come from third-party RSS feeds; if a feed is down at build time, the page lists it as unavailable for that update.
- Vercel's free Hobby plan is for non-commercial use; a commercial FinanceGo needs the Pro plan.

## Project structure

```
src/
  app/
    [lang]/            All pages, in /en/ and /es/ (layout.tsx is the root layout per language)
    (root)/            "/" → redirects to the visitor's language
    global-not-found.tsx, sitemap.ts, robots.ts
  components/          UI by section (learn, practice, challenge, interview, brain-teasers, news,
                       planner, dashboard, behaviourals, tools, career, i18n, layout…)
  content/             Courses, questions, mock interview, brain teasers, behaviourals, careers, tools
  lib/
    finance/           Pure, unit-tested formulas (TVM, WACC, DCF, bonds, LBO, M&A, comps, options…)
    store.ts           Local progress store (useSyncExternalStore + localStorage)
    planner.ts         Interview plan generator and .ics export
    news.ts            RSS parsing, the daily selection and concept links
    i18n.ts            Languages and link helpers
    mock-interview.ts, challenge.ts, practice.ts, progress.ts, search.ts
scripts/               Contour patterns and the social preview image
.github/workflows/     CI and the 9:00 news rebuild
```

### Adding content

- **A question:** add an object to `src/content/questions/bank-*.ts`. `npm test` validates its structure and links. `content.test.ts` keeps the 500 Challenge at exactly 500.
- **A lesson or course:** follow `src/content/courses/dcf.ts`, then register the course in `src/content/courses/index.ts` and remove it from `catalog.ts`.
- **A mock interview question or brain teaser:** add it to `src/content/mock-interview.ts` or `src/content/brain-teasers.ts` with both English and Spanish text; the tests check the answers and structure.
- **A news source:** add its RSS feed to `NEWS_SOURCES` in `src/lib/news.ts`.

## Suggested next steps

1. Accounts and per-user storage (e.g. Supabase with row-level security), migrating the local store, with an updated privacy policy.
2. Spanish versions of the courses, the 500 questions and the career guides.
3. More complete courses (Precedent Transactions, Accretion / Dilution, Derivatives).
4. Adaptive difficulty and spaced repetition for the question bank.
5. Privacy-friendly analytics (no cookies) and a custom domain.
