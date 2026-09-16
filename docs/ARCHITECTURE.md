# Architecture decision record set

Status: **proposed; not implemented or benchmarked**. Review cut-off: 2026-09-15.

## ADR-001 — Independent application; narrow first production boundary

Build a standalone self-hosted personal/small-team product. Do not embed three proprietary applications behind tabs. Do not assume vendor Web SDKs provide a redistributable application runtime [S14]. Public source distribution and private workspace data are separate concerns.

The 1.0 permissions boundary is the workspace: owner, editor and viewer. All ordinary content within a workspace is governed by that membership boundary. Cross-workspace references, arbitrary per-card public shares, enterprise billing, SSO certification and end-to-end encryption are outside the first production promise. This is a deliberate scope boundary, not a statement that these features cannot be built.

## ADR-002 — Stable domain identity before UI state

Use non-semantic stable identifiers for workspaces, notes, blocks, boards, placements, assets, relations and commands. Titles and filesystem paths are mutable attributes, not primary identifiers. Block IDs need a tested split/merge policy.

A placement references a note and carries board-local geometry and presentation. A note does not carry a single global canvas position. Removing a placement never deletes its note. The product must expose separate commands for remove-from-board, duplicate-as-independent-note and move-note-to-trash.

A board connector joins spatial objects. A knowledge relation joins knowledge entities and has an explicit type and evidence state. Promoting a visual connector into a semantic relation is an explicit operation. Derived graph layout never writes over manually arranged board coordinates.

Example proposed entities:

```text
Workspace(id, membershipPolicy)
Note(id, workspaceId, title, documentId, metadata, deletedAt)
Block(id, noteId, type, attributes)
Board(id, workspaceId, documentId, title)
Placement(id, boardId, targetEntityId, x, y, width, height, display)
BoardConnector(id, boardId, fromPlacementId, toPlacementId, geometry, label)
KnowledgeRelation(id, workspaceId, fromEntityId, toEntityId,
                  relationType, evidenceRefs, assertionStatus)
Source(id, workspaceId, assetId, revisionHash, mediaType)
Annotation(id, sourceId, sourceRevisionHash, selector, quote, noteId)
Command(id, workspaceId, actorId, deviceId, type, state)
DurableReceipt(commandOrUpdateId, storageRevision, committedAt)
```

This is a conceptual contract, not a database migration or executable schema. Card reuse follows a documented Heptabase design principle [S07]; the proposed implementation is independent.

## ADR-003 — One content authority and controlled projections

The recommended application model makes structured collaborative documents the canonical editing representation. Local and server replicas represent the same document state. SQL summaries, backlink indexes, full-text indexes and graph projections are derived, rebuildable materializations. Authorization and membership remain server-controlled records, not client-editable CRDT fields.

Markdown and JSON Canvas are interchange projections. They are not additional writable masters. This does not claim native Obsidian-vault equivalence [S01,S06]. A later desktop filesystem bridge must store the last exported base revision and compare three states: the exported base, the current native document and the externally changed file. No full-document overwrite of an active collaborative document is allowed as an automatic synchronization shortcut.

Unknown rich nodes must be preserved in the native bundle and surfaced in a fidelity report. Where a Markdown projection cannot represent a feature, use a readable fallback plus versioned sidecar metadata. Never silently discard unknown blocks, source anchors or note identity. Tiptap's Markdown extension is still described as Beta; using it does not itself validate this contract [S26].

## ADR-004 — Replaceable editing and rendering components

Primary candidate: React/TypeScript UI, Tiptap editor, Konva scene rendering with controlled HTML editing overlays, Sigma.js/Graphology graph rendering, Yjs with a Hocuspocus-based network service [S25,S27,S30–S33]. This choice minimizes dependence on a single commercial canvas SDK, but increases owned integration work.

Alternative spike: BlockSuite PageEditor/EdgelessEditor. Evaluate shared document behavior, custom card identity, input methods, mobile performance, source interoperability and the exact package licenses [S20]. tldraw is a valid commercial evaluation candidate only after the applicable production license is accepted [S21]. React Flow is not the default general whiteboard engine [S22].

Renderer-specific serialized state must not become the only archive format. Add an adapter boundary so changing a canvas or graph renderer does not destroy the note library or relation model.

## ADR-005 — Partitioned collaborative documents

Use one document per note and one per board, with bounded workspace manifests for discovery. Do not load an entire large workspace merely to open one card. Awareness/cursors and drag previews are ephemeral. They are not a permanent action log and are not trusted identity assertions from clients.

Local edits go to the local document and persistent outbound queue. The server authenticates the connection, authorizes the document and enforces size/rate/schema constraints. Persist accepted updates before issuing a custom durable receipt. A transport-level sync event is not a durable storage receipt. Database failure, queue saturation or validation rejection must prevent a false 'saved on server' status.

Hocuspocus supplies hooks; the application still owns its authentication, revocation and receipt semantics [S33]. Do not assert the default hook sequence already satisfies these durability requirements.

Cross-document operations need an idempotent command ID, retry-safe state transitions and recovery. Creating a note plus placing it on a board is not magically one atomic transaction because both objects use CRDTs. Design a pending-reference state and deterministic completion/compensation. Persist a command receipt only for the portion actually committed.

## ADR-006 — Lifecycle, conflicts and garbage collection

Track explicit tombstones for trashed entities. Boards render a clear missing/trashed-reference state rather than silently creating a new note. Define what happens when an offline device edits an entity that was deleted or whose permissions changed: quarantine/export the local change and explain the rejection; never silently discard it or resurrect the entity.

Own-user undo must not erase another collaborator's intervening work. Semantic conflicts that CRDT convergence does not answer—two simultaneous layout moves, conflicting title changes, external file replacement, schema-version disagreement—need declared policies and tests.

Do not garbage-collect assets solely because one snapshot no longer mentions them. Consider retained revisions, pending commands, offline devices and backup retention. Expired offline clients may require a controlled resync rather than arbitrary replay into a newer schema.

## ADR-007 — Local-first does not mean browser storage is infallible

The browser version uses IndexedDB for documents, receipts and pending changes; cache the offline shell separately. The UI shows whether each asset is available offline. Request persistent browser storage when appropriate, but also provide explicit full export and server backup because storage may be evicted or cleared [S31,S35].

Save-state UI: local persisted, pending upload, server durable, blocked/rejected. A browser close must not be advertised as safe if local persistence has not completed. A service worker must not cache authenticated API or private asset responses indiscriminately across users. Logout/account switching must isolate caches and warn before deleting unsynced changes.

A later desktop shell can add real filesystem integration and OS-protected credentials. It is not part of this package and must not be marketed as completed.

## ADR-008 — Authorization and sharing without reference leaks

Enforce membership at API, WebSocket document join/write, search, export job, object download and background-job boundaries. A frontend 'read only' flag is not authorization. Server-derived actor identity must replace client-supplied labels in audit and awareness metadata. Validate request origin, session lifetime, message bounds and token revocation [S37].

The initial workspace boundary prevents cross-workspace placements. Later granular sharing requires an explicit reference graph permission review: card body, title, thumbnail, cached preview, graph adjacency, backlink counts, attached source files, AI retrieval and export all need filtering. Viewing a board must not automatically grant access to all referenced private content.

Revocation blocks future server access and terminates authorized sessions where possible. It cannot retroactively erase data a legitimate client already downloaded. Do not promise remote wipe or E2EE without implementing and testing the relevant architecture.

## ADR-009 — Sources and AI provenance

A PDF anchor contains source identity, content hash/revision, page, normalized region and text/context selectors where available. If the source changes, mark the anchor stale and require verified re-anchoring rather than silently pointing to a different sentence. Extraction failures remain visible. PDF.js is rendering infrastructure, not a complete annotation provenance model [S34].

AI receives only explicitly selected authorized material or an authorization-filtered retrieval set. Treat documents as untrusted data, not system instructions. Store generated claims separately from verified quotations and user interpretations. AI edits are proposals with a diff, evidence list and action count, accepted through an explicit user command. Use idempotency, usage limits, cancellation and timeouts. Provider secrets stay outside browser bundles and source control.

A disabled/unconfigured AI provider must not break ordinary reading, editing, search or export. No free API entitlement is inferred from a promotional screenshot or a third-party subscription.

## ADR-010 — Scene performance and faithful export

Use one world-coordinate model for canvas drawing, DOM overlays, hit-testing and export. Spatial indexing and viewport culling limit interactive work; low zoom shows summaries rather than a live rich-text editor for every card. A graph's force/layout computations run off the main thread where practical and never change the manual board layout.

Konva explicitly excludes DOM portals from canvas output [S28]. Build a deterministic export scene that renders note text, connectors and sources from data, not a raw screen capture. Large boards need tiled images or paginated/vector-aware exports with checked text wrapping and CJK fonts. Do not ship exports with missing card bodies.

Touch input, IME composition, selection, browser zoom, device pixel ratio, keyboard navigation and screen-reader list alternatives belong in the interaction model rather than post-release cleanup. Performance goals require a fixed fixture and recorded device/browser profile [S29].

## ADR-011 — Deployment and recovery

Suggested initial topology: static web assets plus a Node API/WebSocket process, PostgreSQL, a worker and a durable asset store. File storage and S3-compatible storage are alternative adapters; do not require an unreviewed extra object-storage product by default. Redis and multi-instance fanout are optional scale-out work, not mandatory architecture decoration.

A Compose-based development/self-host release can use a reverse proxy for TLS. Supply explicit volume permissions, bounded upload sizes, startup migrations, readiness/liveness checks, graceful shutdown and redacted logs. Back up database state together with the referenced asset versions. Restore on a separate clean environment before declaring a release usable.

GitHub Pages can serve static content but does not host this backend [S36]. GitHub source publishing is not deployment, and deployment is not a completed backup/recovery plan.

## ADR-012 — Versioning, licensing and public release

Pin exact dependency versions and retain lockfiles. Record per-package license evidence, notices and any separate extension/service terms. A branch-level README is insufficient for a release audit [S18–S26]. Keep original code and third-party obligations separate. No change to the root application license can erase upstream requirements.

Version the native archive and collaborative document schemas. Each supported upgrade needs fixtures and a recovery path. A new public release requires passing evidence for all blocking gates in PRODUCTION_GATES.md, an SBOM, a threat-model review and an explicit statement of supported deployment scale.
