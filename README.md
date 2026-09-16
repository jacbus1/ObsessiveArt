# ObsessiveArt

[繁體中文](README.zh-Hant.md) · [Architecture](docs/ARCHITECTURE.md) · [Security](SECURITY.md)

**Linked notes. Visual canvases. A knowledge graph. One local workspace.**

ObsessiveArt is a working, single-user, local-first web application inspired by the workflows of Obsidian, Miro and Heptabase. It is independently implemented, not affiliated with those products, and does not include their proprietary code.

## Run it now

Install Node.js 22 or newer, then:

```sh
git clone https://github.com/jacbus1/ObsessiveArt.git
cd ObsessiveArt
npm start
```

Open **http://localhost:4173**. There is **no `npm install` step**, no API key, no account and no external database. Do not double-click `index.html`; ES modules and browser storage need a web origin. Use the same URL, browser and port on subsequent visits.

## What works in v0.1.0

- **Notes:** Markdown editing and safe preview, split view, titles, tags, pinning, full-text search, `[[wikilinks]]`, stable-ID link insertion, backlinks, 25 editing-session snapshots and trash/restore.
- **Canvases:** multiple boards; reuse the same note without copying its body; drag, pan, zoom, resize, Shift multi-select/box-select, sticky notes, frames with enclosed-card movement, labeled visual connectors, image/PDF attachments, structural undo/redo and SVG export.
- **Graph:** derived from note links (not canvas arrows), text/tag filtering, local-neighborhood view and clickable note nodes. Rendering is capped at 200 notes per view.
- **Data:** actual IndexedDB transactions with stale-writer rejection, previous-commit recovery copy, full JSON backup/restore, previewed multi-file Markdown import, readable Markdown/attachment ZIP export, offline app-shell caching, English/Traditional Chinese and light/dark mode.

The sample notes are editable examples, not screenshots. Edit the PCA card and switch to the second canvas: its content is shared while placement remains independent.

## Important data boundaries

**Your content stays in this browser.** Publishing source code or hosting this application does not publish your notes. This version does not upload note data, use analytics, load runtime libraries from CDNs, or call AI services.

Browser storage is not an external backup. Clearing site data, using a private window, changing browser/domain/port, or device failure can make content unavailable. Download a **full JSON backup** regularly and verify it. Markdown ZIP is a readable export, not a full-fidelity backup. Your data is not encrypted by an application-level encryption scheme.

When two tabs race, a stale writer is rejected instead of silently overwriting newer data. The app pauses saving and offers a backup; export unsaved work before reloading. This is **not real-time multiplayer or cross-device sync**.

## Scope and release status

**Usable local-first v0.1.0; not a claim of complete Obsidian/Miro/Heptabase parity or enterprise production certification.** There is no account system, cloud sync, multiplayer, AI, OCR, full PDF reader/highlight anchors, handwriting, arbitrary rich-text blocks, or lossless Miro/Heptabase importer. Attachments can be displayed as images or downloaded; PDF attachments are not parsed. Markdown supports a documented subset; raw HTML never executes. Edits are plain Markdown rather than a third-party WYSIWYG editor.

Structural Undo history is in memory and resets on text editing to avoid reverting newer text through an old canvas snapshot. Text fields use the browser's native Undo; longer-term text recovery uses History. A frame groups enclosed cards when moved, not through persistent parent/child membership.

Limits: 5,000 notes, 150 canvases, 5,000 total canvas objects, 200 attachments, 8 MiB per attachment, 250,000 characters per note, 16 MiB total text/history, 40 MiB native backup. These are safety limits, **not verified scale/performance promises**. See [release verification](docs/RELEASE.md).

## Deploy a static website

```sh
npm run check
npm test
npm run build
```

Serve `dist/` with any static HTTPS host. All asset paths are relative, including the service worker, so repository-subpath hosting is supported. A Docker configuration is also included. The public web host serves code; each visitor has their own browser-local workspace.

For GitHub Pages: in **Settings → Pages**, set **Source → GitHub Actions**, then run **Actions → Deploy to GitHub Pages → Run workflow**. The workflow is manual; a repository push alone does not prove that a live site exists. Changing from localhost to Pages creates a separate storage origin: transfer your full JSON backup explicitly.

The service worker activates a new shell after old tabs close. If an update is waiting, save, close all app tabs, and reopen. Cache versions must be bumped when runtime assets change. Never clear site storage casually to update the app.

## Tests

```sh
npm run check
npm test
npm run build
# Optional browser tests (run server in another terminal):
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/browser_test.py
```

CI performs syntax checks, domain/security tests, a static build and real Chromium E2E tests (IndexedDB reload, stale-write rejection, backup restore and offline reload). It uploads browser screenshots and a JSON test report as artifacts. A configured test is not automatically a passing test; check the actual Actions result for your commit.

## License

Original application code: MIT. No third-party runtime dependencies or bundled font files. GitHub Actions and optional testing tools retain their own licenses. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
