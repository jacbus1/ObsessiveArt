# Initial verification record

This report records execution evidence for the v0.1 submission. It is not a production certification and does not substitute for GitHub CI results.

| Check | Result | Scope |
| --- | --- | --- |
| `npm run check` | PASS | Syntax checks of shipped JavaScript modules |
| `npm test` | 61 PASS, 0 FAIL | Model/Markdown validation, SQLite persistence and conflicts, backup/restore, HTTP API, authentication, Host/Origin/CSRF guards, size and auth-work limits |
| UI smoke, isolated renderer | 9 PASS, 0 FAIL | Real DOM interaction with local API request bridge; mock browser recovery storage |
| Full browser HTTP mode | NOT RUN locally | Browser navigation blocked by execution-environment administrator policy |
| Browser-native IndexedDB/cookie/CSP integration | NOT VERIFIED locally | Explicitly outside isolated-mode coverage |
| Docker image build and TLS reverse proxy | NOT RUN | No deployment evidence claimed |
| Node 24 compatibility | CI configuration supplied; result pending | Local tests ran on Node 22.16.0 |
| Load, soak, crash-injection, external security audit | NOT RUN | Required before a production claim |

Local runtime: Node 22.16.0 (built-in SQLite 3.49.1), Python 3.13, Playwright 1.57.0, Chromium 144.0.7559.96 on Linux. The Node SQLite API emits an experimental warning on this runtime.

The nine UI cases cover initial rendering/search, Chinese note editing with server persistence, cross-board shared content and safe placement removal, visual vs semantic connections, drag/resize/undo, safe Markdown rendering, export/import round-trip, stale-tab conflict blocking, and Traditional Chinese/mobile-width editor layout. Desktop screenshots were visually inspected. Mobile-width testing is not a physical-device touch or accessibility audit.

Isolated mode is an explicit fallback, not hidden test substitution: it loads the same local application sources into a non-navigated browser document. API calls go to a real temporary local HTTP server through a test bridge. Browser recovery, downloads and insecure-context crypto conveniences are test doubles. It does not validate production HTTP asset delivery, browser cookie transport, CSP enforcement, origin-specific storage, offline reload or navigation lifecycle.

Reproduce the local fallback:

```bash
OBSESSART_UI_ISOLATED=1 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium \
python tests/browser_smoke.py
```

Normal browser mode uses actual HTTP navigation and the real storage/fetch modules:

```bash
python -m playwright install chromium
python tests/browser_smoke.py
```

The included GitHub workflow is intended to run normal mode, not the fallback. A workflow file is not evidence that the workflow succeeded. Review the PR checks before merging. Tests use only generated fictional data and temporary directories.
