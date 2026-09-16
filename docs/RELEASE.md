# v0.1.0 release verification

Build date: 2026-09-16. Scope: single-user, browser-local web app.

## Executed in the implementation environment

- Node.js 22.16.0: `npm run check` passed.
- Node.js domain/security tests: 37 passed, 0 failed at initial verification.
- `npm run build`: passed; eight static runtime files produced.
- HTTP server: local GET returned 200 and the configured security headers.
- Chromium component smoke run: six seeded cards rendered; double-click editing, shared-note update on another canvas, graph display, preview and 390px layout passed without uncaught JS errors. This particular local smoke used in-memory storage stubs because environment policy blocks browser navigation; it does NOT prove IndexedDB or offline behavior.

## Real-browser suite

`tests/browser_test.py` exercises the unmodified app over HTTP in Chromium: first run, Unicode IndexedDB reload, history, drag persistence, placement removal and undo, graph filtering, XSS escaping, Markdown import, full backup export and fresh-profile restore, real stale-writer rejection, offline reload and mobile layout. GitHub Actions runs this suite and publishes `browser-results.json` and screenshots.

The existence of this suite does not imply a pass. Consult the Actions run for the exact commit. Do not replace pending tests with a blanket “production ready” badge.

## Not verified here

Real iOS/Android devices, Safari/Firefox, native IME edge cases, sustained 5,000-note workloads, external security/accessibility audit, storage quota injection, process-kill durability, migration from future schema versions, Docker execution and a publicly deployed Pages site. Safety limits are not measured performance guarantees. The manual Pages workflow requires repository Pages configuration and a successful actual deployment.
