# Architecture — v0.1

## Boundaries

This first vertical slice is intentionally framework-free: browser ES modules, HTML/SVG rendering, a Node HTTP service and built-in SQLite. There is no bundler, runtime npm dependency or external database service. It validates the shared-content model before committing to a larger editor/canvas stack. It is not a collaborative CRDT system or a multi-tenant service.

`public/model.mjs` is shared by browser and server. Server validation is authoritative. Unknown fields are stripped. IDs are constrained, source URLs are HTTP(S)-only, positions and document sizes are bounded, and dangling references are rejected.

## Domain

A workspace contains notes and boards. Each note owns its body, title, tags, color, source URL and trash state. Each board owns placements referencing note IDs and connectors referencing placement IDs. Removing a placement removes associated connectors, not the note. Trashing a note does not destroy its placements. Board-specific position and size do not change another placement of the same note.

Stable `[[id|label]]` references survive renaming. Title lookup must be unambiguous. Knowledge edges are derived from note bodies, excluding inline/fenced code and trashed targets. Board connectors never become semantic facts. Source URLs are stored as provenance hints; no remote fetching or invented page anchors is performed.

## Persistence and concurrency

The server stores a validated JSON snapshot per accepted revision. `BEGIN IMMEDIATE` and an expected-revision precondition make concurrent stale writes fail with HTTP 409. WAL and synchronous FULL are configured; acknowledgement follows COMMIT. Recent history is bounded to 50 full snapshots, not an unlimited audit log.

The browser debounces edits, serializes requests and updates its revision after server acknowledgement. New edits made during a save are submitted afterwards. Browser IndexedDB stores an auxiliary, tab-scoped recovery draft; storage failures must not be described as successful persistence. Multiple tabs can detect conflicting server revisions, but there is no push synchronization or automatic merging. Duplicating a browser tab can copy its session storage identity; recovery drafts are not a replacement for exports.

The whole workspace is loaded and searched in memory. Caps are 2 MB canonical JSON, 1,000 notes, 100 boards and 1,000 placements per board. These limits constrain this implementation; they are not benchmark results.

## Trust boundaries

Only explicit public assets are served. Data directories and environment files are never static roots. Host and Origin are validated. All state-changing API requests require the configured origin plus an application header. Password sessions are random, stored as hashes in memory, HttpOnly and SameSite=Strict; HTTPS adds Secure. Restarting the server invalidates sessions. An owner password is not a roles/tenant system.

Markdown rendering escapes user text, disables raw HTML and does not embed remote images. The CSP allows same-origin scripts and inline style attributes required by card positions, but not inline scripts. Production mode requires HTTPS PUBLIC_URL behind a correctly configured TLS proxy.

## Backup formats

Native JSON: current notes, boards, placements and relationships, stable IDs, format version and SHA-256 checksum. It excludes credentials and history. Import validates the checksum and schema, preserves note/board identities, adopts the destination workspace identity, and writes a new revision. It is a replace operation, not a merge.

SQLite backup: the full current database with the retained history. Use the online backup API, not a live main-file-only copy that ignores WAL. Recovery JSON: an explicitly different format containing a draft and base revision for manual conflict reconciliation.

## Known engineering debt

No attachments, PDF pipeline, external file watcher, transactional outbox, per-document streaming, full Markdown parser, CRDT, service worker, real-time session revocation across rendered tabs, fine-grained access control or encrypted local database. Structural undo uses in-memory snapshots; text editing uses the native editor undo and server history. Browser recovery, accessibility and load/fault behavior need full deployment-level verification before a production claim.
