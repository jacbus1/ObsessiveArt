# Interchange and migration contract

Status: **proposed**. No import, export or restore was executed. Source references resolve in SOURCES.md.

## 1. Two exports, two promises

**Native archive:** a versioned, complete representation of supported application state. It preserves stable note/block/placement IDs, relationships, source selectors, assets and board geometry. Exporting and reimporting the same supported schema into a clean workspace must preserve these invariants. Optional history needs an explicit include/exclude setting. Credentials, session tokens, provider secrets and internal server logs are never included.

**Open projection:** readable Markdown, JSON Canvas and assets, with a fidelity report and sidecars where necessary. This is a portability format, not a claim that JSON Canvas or Markdown encode the entire application. JSON Canvas 1.0 covers text/file/link/group nodes and edges, not the full proposed history, permission and source model [S06].

Proposed archive layout:

```text
manifest.json
notes/<stable-id>.json
boards/<stable-id>.json
relations.json
sources.json
annotations.json
assets/<content-hash>.<validated-extension>
projections/markdown/...
projections/canvas/...
fidelity-report.json
```

The manifest records schema version, export application version, export timestamp, entity counts, asset hashes, content revision coverage and optional-history status. A portable snapshot is the archive contract; opaque CRDT bytes may be an additional acceleration/recovery artifact, not the only readable structure. Identity mappings and permission policies must be reassessed when importing into another workspace.

## 2. Fidelity classes

| Class | Meaning | Release requirement |
|---|---|---|
| Native complete | All documented native entities preserved within the supported version | Identity, references, geometry and asset checks pass |
| Supported projection | Documented Markdown/Canvas subset is preserved | Fixture round trips plus a declared feature matrix |
| Degraded but retained | Structure cannot be reproduced but content is safely retained | User-visible warning, readable fallback and original/source metadata |
| Unsupported | Import cannot safely represent an item | Report exact item/type/count; no silent skip |
| Rejected | Unsafe, malformed, unauthorized or over-limit input | Actionable error; transaction leaves workspace consistent |

Do not assign 'complete' based only on matching object counts or a screenshot. Compare supported content trees, links, tags, source anchors, geometry and asset hashes.

## 3. Obsidian adapter

Parse Markdown using syntax-aware handling, not a global regular expression that also rewrites examples inside code fences. Prioritize frontmatter, local assets, ordinary Markdown, wikilinks, aliases, heading/block references and JSON Canvas's supported subset. Build a stable import map before resolving references. Preserve unresolved and ambiguous links explicitly.

Fixtures must cover duplicate basenames in different folders, Chinese/English mixed names, Unicode normalization, escaped link delimiters, renamed notes, relative paths, attachments reused by several notes, callouts, math, tasks, tables, code fences, broken links and empty files. Unknown plugin syntax is retained as text or an opaque supported fallback, not executed. A Bases file is not automatically an executable database view in the new application [S03].

Tiptap Markdown support does not prove this adapter correct; the official Markdown documentation remains Beta [S26]. Exact text identity need not be promised where formatting normalization is declared, but semantic content and documented references must round-trip.

Default import copies into a new workspace. Do not overwrite the original vault. A future two-way filesystem bridge is a distinct feature with base-revision tracking and conflict handling, not this importer.

## 4. Miro adapter

Use only user-authorized official API resources and supported exports. Preserve provider item IDs in a namespace-qualified import mapping. Handle pagination, item/connector ordering, attachments, offsets and supported geometry. Importing the same source twice must offer duplicate, update or cancel behavior explicitly; it must not silently create duplicates.

The SDK/REST contract does not expose every Miro item type or capability [S15]. Build an unsupported-item report and test against authorized sample exports. Native provider backup formats must be examined before claiming support. A PNG/PDF visual export can be attached as a reference image/document; it is not an editable reconstruction of the original board [S16].

Raw provider HTML is untrusted. Sanitize supported formatting and retain provider/source attribution. Respect source permissions and do not make private external assets public merely because the destination source repository is public.

## 5. Heptabase adapter

Prefer official user exports or supported CLI/MCP reads, with a mapping for card identity, card type, properties, board placements and references. The official CLI documentation identifies the note content field as a JSON-encoded ProseMirror document string, not directly nested content; decoding it does not imply schema compatibility with our editor [S09].

Important current limit: CLI PDF highlight reads do not expose the original PDF ID, page, region coordinates or equivalent precise deep link. Official documentation says a full-account export is required for those anchors. Highlight body editing is also limited. Do not invent anchors from the card title or claim complete provenance migration from plain extracted text [S09].

CLI schematic screenshots are visual-review artifacts, not exact content/layout exports. Do not edit Heptabase internal databases or caches. Before promising a complete adapter, inspect a sanitized and authorized export containing at least a reused card, an annotation, a nested board, a relation and an attachment. No such sample was inspected in this research.

## 6. Asset and source integrity

Store original assets by verified content hash inside the workspace security boundary. Deduplication must not leak whether another tenant has the same private document. A source anchor targets a particular asset revision. On a changed source, retain the prior asset where permitted and mark annotations requiring re-anchoring.

Assets can have unknown or pending offline availability. An exported bundle must either include every required asset or report exact omissions with reasons and download state. Do not report a successful complete export while referenced file downloads are still pending.

## 7. Import security and consistency

Reject path traversal, absolute paths, symlink escapes, oversized decompression, excessive file counts, deeply nested malformed objects, unsupported schema versions and unauthorized cross-workspace IDs. Validate MIME/content independently of extension. Treat HTML, embedded SVG, PDFs and external URL metadata as untrusted. Processing runs with bounded memory/time and appropriate isolation.

Remote content fetching needs SSRF controls: approved protocols, destination validation, redirect re-validation, private/metadata-address protection and network egress restrictions [S38]. A user's request to import an ordinary website is not permission to reach internal services.

Preflight returns a dry-run report: entities, assets, duplicates, unsupported types, privacy warnings and estimated limits. Applying an import uses an idempotent job/command with staged assets and a defined activation point. A failed job must not leave a partially visible, untraceable workspace. Cancellation and retry behavior are part of the API contract.

## 8. Export and restore evidence

For native round trips, compare stable identity maps, supported note content, board transforms, semantic vs visual edges, source selectors and file hashes in a fresh workspace. Test restricted users cannot export content they cannot read. Test corrupted and truncated archives fail safely. Show a readable report, not merely 'success'.

Disaster recovery is separate from user export. A production backup must consistently cover server database state and referenced asset versions. Restore with documented keys/configuration into an isolated environment, verify counts/hashes/references and record the achieved recovery time and recovery point. Proposed or configured backups are not proof that restore works.
