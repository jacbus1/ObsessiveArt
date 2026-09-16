# Implementation backlog and handoff

Status: proposed; no task below is claimed complete. This package does not dispatch another model or schedule background work.

## Scope and sequence

Use a dedicated repository with private-by-default development. Keep public code independent of personal notes and credentials. Submit reviewable changes on a branch; do not force-push main. Choose an original product name and license separately from third-party dependencies.

### Milestone A — Resolve the expensive uncertainties

| ID | Work | Completion evidence |
|---|---|---|
| A01 | Pin candidate dependencies and review actual package licenses | Lockfile, license inventory, notices and decision record |
| A02 | Prototype one editable rich-text card on a pan/zoom canvas | Chinese input, selection, coordinate alignment and complete export demonstrations |
| A03 | Compare BlockSuite shared-document approach against the primary candidate | Same fixture/interaction comparison, exact license/version scope, decision rationale |
| A04 | Prototype canonical note + multiple placements + separate graph relation | Domain invariant tests and a reload-persistent vertical slice |
| A05 | Prototype two-device offline edit/reconnect with durable receipts | Real server/database fault evidence, not a mocked event log |
| A06 | Establish Markdown/Canvas fixtures and authorized migration samples | Declared support matrix, unsupported-item report and safe staging design |

Do not spend the first milestone on a giant toolbar or an attractive graph with copied note bodies. Fail fast on content identity, rich editing, fidelity and durability.

### Milestone B — Three perspectives on real durable data

Implement stable entity IDs, note/block editing, title/alias handling, note-to-note links, derived backlinks, basic search, card placements, board text/shapes/connectors, graph filtering and navigation. Add local persistence and explicit save states. Implement native export/import into a clean workspace, history/trash behavior and a restore check.

The demo must be reproducible from a clean clone, contain only synthetic sample data and survive close/reopen. Scope remains a development/beta milestone until all production gates pass.

### Milestone C — Research and small-team behavior

Add PDF/source records, annotation selectors and stale-anchor handling; multiple boards/sections; richer selection/alignment/freehand tools; workspace owner/editor/viewer roles; server-enforced document and asset access; real-time collaboration; mobile workflows; safe import jobs and cancellation. Build cross-document command recovery and audit events before adding broad AI write privileges.

AI begins as optional read-only selected-context assistance, then explicit proposals with diffs and user approval. Provider adapters must not couple core app availability to a paid model or to third-party web-session cookies.

### Milestone D — Production qualification

Complete the authorization, failure, recovery and interoperability matrices. Run performance fixtures on recorded hardware and correct bottlenecks. Build release containers, deployment instructions, monitoring, redacted logs, backup/restore procedures and upgrade recovery. Produce a release report that lists passed, failed, waived and unsupported items. Only then decide whether the advertised production boundary is met.

## Suggested independent workstreams

Domain/interchange owner: identifiers, source provenance, archive schema, migration fixtures. Editor/canvas owner: text editing, scene interactions, coordinate model and exports. Sync/backend owner: persistence receipts, ACL, jobs, isolation and recovery. QA/release owner: end-to-end cases, device matrix, failure injection, release evidence and docs. With fewer people, sequence rather than pretending these tasks happen in parallel.

These are role suggestions, not claims that Codex, Claude or another agent was assigned work. Each agent/developer should receive exact file ownership and stable interfaces to avoid incompatible schemas and concurrent rewrites.

## Rough planning envelope

For an experienced two-to-three-engineer team with QA support, 12–20 weeks is a starting planning hypothesis for a bounded self-hosted small-team product after scope confirmation. It is not a guaranteed duration, paid quote or completion forecast. Re-estimate after Milestone A. Full bidirectional filesystem interoperability, arbitrary granular sharing, enterprise controls and E2EE change the scope materially.

## Engineering handoff instruction

Start by reading README.md, ARCHITECTURE.md, INTERCHANGE.md and PRODUCTION_GATES.md. Implement the smallest durable end-to-end slice. Maintain the note/placement separation, distinguish cosmetic connectors from semantic relations, and never label planned tests as passing. Record exact dependency versions and unresolved risks. Keep source data private. Require explicit approval for remote publication or destructive migration.
