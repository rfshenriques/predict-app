# Propline

Player projections for the next games, sport by sport. Installable iPhone web app.

- The site is the repo root (`index.html`, `sw.js`, `manifest.webmanifest`, icons, `splash/`). Netlify publishes `.` with no build step.
- Sources are in `src/`. Rebuild with `python3 src/build.py` from a project folder laid out as in the build script, then copy `site/*` to the root.
- To add a sport: add a data file like `src/part-data-nba.js` and one `registerSport({...})` block in `src/part-sports.js`.
