# N년전오늘 — 웹앱 MVP

Mobile-first PWA using the supplied monthly workbook. November's visible top-three stories have expanded copy and direct source links; the rest of the imported dataset remains editorial candidate material.

## Run

Run `npm run build`, then `python3 -m http.server 8000`; open `http://localhost:8000`. PWA install/offline caching require HTTP, not `file://`.

## Data

`npm run data:import` reads the original XLSX with Python's standard library and rewrites `data/events.js`. It imports all 3,937 candidates across 366 dates. `npm run data:check` verifies coverage, grade range and candidate-only publication status.

The UI selects up to three events per date by predicted interest grade, retaining source order on ties. Grade is an editorial ranking hint, not source verification. `npm run widget:data` creates a compact daily-featured file for the widget preview.

## Scope

Today, story detail, month calendar, saved stories (local storage), Monday–Sunday weekly quiz and streak, a static PWA shell, colored install icon, social preview, and a **developer-only** small/medium app-widget design preview at `/widget.html` (not linked from the home screen). Native iOS/Android home-screen widgets require an app extension and are not included; CMS, accounts, and production-ready 366 story illustrations are also not included.
