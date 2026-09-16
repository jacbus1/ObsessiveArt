# ObsessArt

**A personal space for connected thinking.**

Linked notes, visual boards and a knowledge graph, sharing one consistent workspace. Repository: `jacbus1/ObsessiveArt`. Product: **ObsessArt**.

[繁體中文](README.zh-Hant.md) · [Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md) · [Test evidence](docs/TEST_REPORT.md)

> **Status: v0.1 personal beta.** This is working application code, not a mockup. It is not yet a production-certified or multi-user release. Read the release gates before using it as your only copy of important information.

## Run locally

Use Node.js 22.16 or later (the initial local test runtime is recorded in the test report). Use a maintained, patched Node release for deployment.

```bash
git clone https://github.com/jacbus1/ObsessiveArt.git
cd ObsessiveArt
git switch feat/obsessart-core # before this PR is merged
npm start
```

Open `http://127.0.0.1:4173`. No runtime packages, package manager install, API key or external database service is required. The app uses Node's built-in SQLite module, which emits an experimental warning in the tested Node 22 runtime. Internet access is not required after obtaining the source and runtime; the local server must remain running.

The first launch creates a small fictional starter workspace. Data is stored in `./data/obsessart.sqlite`, never in GitHub. Browser recovery drafts are auxiliary and are not an independent backup.

## Included

| Area | Working scope |
| --- | --- |
| Notes | Markdown source/preview, stable internal links, tags, source URL, search, backlinks, trash and restore |
| Boards | Reusable note cards, move, resize, Shift multi-select, pan, zoom, fit, directional connectors, structural undo/redo |
| Connections | Graph derived from note links; board arrows do not create knowledge relationships; selected-note neighborhood |
| Storage | SQLite WAL with full synchronous commits; explicit revision preconditions; stale edits return a conflict instead of overwriting |
| Recovery | Last 50 workspace snapshots; native JSON backup with checksum; single-note Markdown import/export; SQLite online backup script |
| Access | Loopback-only personal mode; optional owner password; password and HTTPS origin required for production mode |
| Interface | English and Traditional Chinese; responsive editor and mobile-sized layouts; keyboard search and save shortcuts |

A note's content has one identity. Its position and size belong to a board placement. Remove a placement or a board without deleting the note. Move a note to the trash without destroying its placements; restore it to display those placements again.

Use **Link note** to insert `[[stable-id|label]]`. These links survive renaming. Plain `[[Title]]` links resolve only when the title is unique. In Connect cards mode, select two cards to add an arrow; repeating the same direction removes that arrow.

## Saving and backups

The status button distinguishes pending changes, server-confirmed saves and failed saves. Open it to export a recovery draft, retry, or explicitly load the server version. A stale tab never automatically overwrites a newer revision.

**Export** downloads a native backup of the current workspace, including unsynced edits that pass validation. It does not include history, credentials or recovery files. **Import replaces** the current workspace after a confirmation. Recovery JSON is for manual reconciliation, not a normal backup import.

```bash
npm run backup
# Optional explicit destination (must not already exist):
npm run backup -- ./backups/manual.sqlite
```

SQLite backup includes the retained history. Keep a separate off-device copy; see the restore procedure in [Deployment](docs/DEPLOYMENT.md).

## Checks

```bash
npm run check
npm test
# Optional real-browser smoke tests:
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-test.txt
python -m playwright install chromium
python tests/browser_smoke.py
```

Initial evidence: **61 Node tests passed; 9 isolated-render UI tests passed**. Isolated UI testing uses a local API bridge and mock browser recovery storage; it does not certify browser navigation, cookies, CSP or IndexedDB. Full browser mode is provided for CI/your machine. See [the report](docs/TEST_REPORT.md), rather than assuming an included workflow has run successfully.

## Current boundaries

Single owner and a single server. No live collaboration, permissions hierarchy, cloud accounts, attachments, PDF annotation, freehand canvas, PWA/offline reload, directory synchronization or AI provider integration yet. No end-to-end encryption. Markdown is a deliberately limited safe subset; arbitrary HTML, embeds and remote images are not rendered.

Safety caps: 2 MB canonical workspace, 1,000 notes, 100 boards, 1,000 placements per board, 100,000 characters per note. The graph previews at most 250 matching notes. These are enforced limits, **not verified scale/performance claims**. All views and search load the current workspace into memory.

See [Roadmap and release gates](docs/ROADMAP.md) and [Security](SECURITY.md). Original application code is licensed under [MIT](LICENSE).
