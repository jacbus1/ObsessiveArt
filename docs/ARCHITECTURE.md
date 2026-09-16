# v0.1 architecture

This implementation deliberately ships a narrow but usable local-first vertical slice instead of presenting the larger research roadmap as finished software. It uses browser primitives and original code with zero runtime package dependencies. Rich-text frameworks, collaborative servers and AI integrations discussed in earlier research remain future design options, not installed components.

## Runtime

`index.html` → `src/app.js` (UI and interaction) → `src/core.js` (pure domain logic) and `src/storage.js` (IndexedDB). `style.css` defines responsive light/dark themes. `sw.js` stores the static shell only. `server.mjs` serves an explicit asset allowlist and `/healthz`; it has no write endpoints or user-content database. `scripts-build.mjs` copies the same runtime files into `dist/`.

Notes are canonical `{id,title,text,tags,color,pinned,timestamps,history}` objects. A board contains independent note placements, sticky notes, frames, attachment placements, connectors and a camera. Graph edges are derived from `[[wikilinks]]`; visual connectors never imply semantic facts. Stable IDs are preferable to title links when titles can be ambiguous.

## Persistence

One versioned workspace document is stored under IndexedDB `obsessiveart-v1/workspace/active`. Each save transaction compares the last observed revision with the current stored revision, writes the previous document to `recovery`, and writes the next revision to `active`. Only `oncomplete` acknowledges a save. Updates are debounced; unfinished writes trigger the navigation warning. Failed writes pause rather than clear data. BroadcastChannel informs other tabs; atomic revision checks protect browsers even without BroadcastChannel.

This whole-document design is intentionally bounded and is not CRDT synchronization. Larger repositories require per-note records and incremental indexing. Do not describe data retained in IndexedDB as disk-encrypted, cloud-backed or immune to quota eviction. The recovery copy shares the browser's failure domain.

## Editing and interaction

Markdown is the canonical body, avoiding competing writable formats. Preview supports headings, unordered/ordered lists, blockquotes, code blocks, basic emphasis, pipe tables, safe external links, canonical wikilinks and local attachments. It is not full CommonMark/GFM or plugin compatibility. Browser native Undo handles typing; structural snapshots cover canvas/CRUD actions, capped at 15 and cleared at a new text-edit session to prevent overwriting newer text with old structural state. Per-note history retains 25 prior editing-session texts, not every keystroke.

Canvas: transformed DOM cards plus SVG connectors. Mouse/pointer movement updates geometry directly; commit happens after the gesture. Frame membership is computed geometrically at drag start. Graph layout is deterministic and capped at 200 visible notes. Neither uses a third-party canvas SDK. SVG export renders safe text and embedded images from the model rather than relying on a canvas screenshot.

## Portability

Native JSON is the complete backup format and includes attachments. It requires schema validation and an explicit replacement confirmation; the current backup must be verified first. Readable Markdown ZIP preserves text and attachments, but not the full workspace. Multi-file Markdown import previews new/unchanged/conflicting paths, never silently overwrites changed imported notes, and does not execute YAML, HTML, plugins or embedded scripts. No ZIP, Obsidian Canvas, Miro or Heptabase importer is claimed in this release.

## Next production gates

Independent security review; Safari/Firefox and real mobile IME/gesture tests; forced process-kill, quota/failure and larger-dataset testing; accessibility audit; durable external backup automation; versioned migrations and downgrade handling. Collaboration, identity, server-side permissions, PDF source anchoring and AI must be separately designed and tested before being advertised.
