# N년전오늘 — 웹앱 MVP

Mobile-first PWA concept using the supplied monthly workbook as a **candidate dataset**. All imported rows are marked unverified; do not publish these summaries as fact-checked editorial content without a source review.

## Run

Run `npm run build`, then `python3 -m http.server 8000`; open `http://localhost:8000`. PWA install/offline caching require HTTP, not `file://`.

## Data

`npm run data:import` reads the original XLSX with Python's standard library and rewrites `data/events.js`. It imports all 3,937 candidates across 366 dates. `npm run data:check` verifies coverage, grade range and candidate-only publication status.

The UI selects the highest-interest-grade event per date as a demo suggestion. Grade is predicted interest, not verification or editorial approval. This status is displayed in the app.

## Scope

Today, story detail, month calendar, saved stories (local storage), static PWA shell. Native iOS/Android home-screen widgets, CMS, accounts, and production-ready 366 story illustrations are not included.
