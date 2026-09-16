# Verified English-first release QA

## Released source

- Pull request: https://github.com/jacbus1/ObsessiveArt/pull/2
- English change: `30d1815967b833aa4092e543274f82ab5e656793`
- Merge on main: `3eca7d3c290810b0efcf4bca9a49ff9cfd22a20f`
- Live application: https://jacbus1.github.io/ObsessiveArt/

This update translates only new-workspace defaults and bundled examples. It does not translate, reset or migrate existing personal notes. Stored language preferences remain unchanged.

## Executed checks, not planned tests

| Evidence | Observed result |
| --- | --- |
| [PR CI run 35057201730](https://github.com/jacbus1/ObsessiveArt/actions/runs/35057201730) | Syntax and build passed; 42 Node tests passed, zero failures; 15 existing Chromium flow checks plus 7 English-language checks passed. |
| [Merged-main CI run 35057330146](https://github.com/jacbus1/ObsessiveArt/actions/runs/35057330146) | Completed successfully for merge commit 3eca7d3. |
| [Pages publication 35057330172](https://github.com/jacbus1/ObsessiveArt/actions/runs/35057330172) | Pre-publication checks, deployment, and published HTML/core-module HTTP checks all completed successfully. |

The PR runner checked out GitHub's combined PR merge ref `84d827770b9a44a4c50cac3d4823304085e4e346`, with Node 22.23.2, Python 3.12.14, Playwright 1.57.0 and Chromium 143.0.7499.4. Browser checks used ordinary HTTP navigation and real IndexedDB, downloads and service-worker offline reload. No browser bridge or mocked store was used in these release checks.

Coverage includes shared notes on independent canvases, edit/reload persistence, Unicode text, history, placement drag/remove/undo, graph filtering, raw-HTML escaping, Markdown import preview, full backup/restore into a fresh browser profile, stale-writer rejection, offline reload and a 390-pixel mobile-width editor. English checks additionally cover new-workspace defaults and round-trip language changes without altering content, history or placements.

## Downloadable evidence and integrity

The following original CI artifacts were downloaded and their SHA-256 values checked against the workflow upload log:

- [Browser evidence, artifact 10431650145](https://github.com/jacbus1/ObsessiveArt/actions/runs/35057201730/artifacts/10431650145): `ba660a4985cbec025aee37c14e60fb8151f10dc72e9ce86d4f33ee14c1c1739f`. The two result JSON files report 15 and 7 passing checks, with empty JavaScript-error lists. English canvas and mobile-width screenshots were visually inspected. Sample/test content is synthetic, not a private user workspace.
- [Tested static site, artifact 10431057462](https://github.com/jacbus1/ObsessiveArt/actions/runs/35057201730/artifacts/10431057462): `7dad003231718e2d92b4046d16b8db8d2a6bb6bd2d0683fe6c0a220ead61a63b`.

Artifacts may expire under repository retention settings. The repository retains reproducible test scripts.

## Review boundaries

**Independent AI sub-agent review was not executed.** No callable independent model-review interface was available. Automated test jobs, GitHub-hosted runners and a same-assistant visual inspection are not independent model reviewers.

Passing these checks does not certify enterprise production readiness, complete feature parity with other products, Safari or physical iPhone compatibility, large-workspace performance, multiplayer, cloud synchronization or third-party penetration testing. Public-site post-deployment verification was HTTP-based, not a full browser E2E run against the public URL.

## Updating without losing data

Wait for the saved status, close all open app tabs, then reopen the site to let the new service-worker shell activate. Do not clear site storage to update the app. Existing Chinese workspaces can use **Data & settings / 資料與設定 → Language / 語言 → English**; their note content stays unchanged. Export a full JSON backup regularly.
