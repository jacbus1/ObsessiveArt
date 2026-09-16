# ObsessiveArt

Local-first knowledge workspace combining linked notes, visual whiteboards, and knowledge graphs.

[繁體中文](README.zh-Hant.md)

## Current status

**Research and engineering specifications; application implementation has not started in this repository.** The production-ready application is the goal, not a claim about this commit. The 50 proposed acceptance cases are all `not_run`; no application build, browser test, concurrency test, import/export round trip, backup restore, security audit or deployment is claimed.

This repository publishes the latest research/specification bundle reviewed on **2026-09-15**. The English and Traditional Chinese documentation are kept separate. No user notes, screenshots, private PDFs, credentials or workspace datasets are included.

## Product direction

An independent application inspired by the workflows of Obsidian, Miro and Heptabase, not a merger of their proprietary code or a plugin that embeds their services. One knowledge model supports document editing, spatial whiteboards and relationship exploration. A card on a board references a note; it is not a second canonical copy.

The first proposed production boundary is self-hosted personal and small-team use. Candidate components and architecture decisions remain subject to implementation spikes, exact-version license review and acceptance evidence.

## Documentation

| Document | Purpose |
|---|---|
| [Traditional Chinese research](docs/RESEARCH.zh-Hant.md) | Product comparison, recommended direction and scope |
| [Architecture decisions](docs/ARCHITECTURE.md) | Identity, canonical content, persistence, collaboration and deployment |
| [Interchange contract](docs/INTERCHANGE.md) | Native backups, Markdown/JSON Canvas and migration fidelity |
| [Production gates](docs/PRODUCTION_GATES.md) | Evidence required before claiming production readiness |
| [Implementation backlog](docs/IMPLEMENTATION_BACKLOG.md) | Dependency-ordered milestones and engineering handoff |
| [License review](docs/LICENSE_REVIEW.md) | Licensing observations and exact-version review requirements |
| [Primary sources](docs/SOURCES.md) | 38 source records and evidence limits |
| [Acceptance cases](specs/acceptance-cases.json) | 50 proposed, unexecuted application cases |
| [Machine-readable sources](specs/sources.json) | Source registry |
| [Status](STATUS.json) | Scope and verification status of this repository snapshot |

`PACKAGE_MANIFEST.json` records file sizes and SHA-256 hashes. Documentation consistency and upload verification are not application tests. Statements in the dated research about work not performed describe the original research round; GitHub publication is recorded by this repository's commit history.

## First implementation milestone

Create one note, reference it from two boards, navigate to it in the graph, edit it offline, reopen it and export/restore into a clean workspace. The note body must remain shared while board positions remain independent. Only claim behavior that has been tested on the actual implementation.

## Proposed application layout

```text
apps/web/                 Browser UI and offline shell
apps/server/              API, auth and WebSocket service
apps/worker/              Import, index, export and file processing
apps/desktop/             Later native filesystem bridge
packages/domain/          Stable identity and command contracts
packages/editor/          Note/block editing adapter
packages/canvas/          Spatial rendering and interactions
packages/graph/           Derived relationship views
packages/sync/            CRDT, receipts and recovery
packages/interchange/     Versioned backup/import/export adapters
packages/ui/              Accessible shared components and locales
tests/                    Unit, integration, browser and failure suites
infra/                    Deployment, backup and restore configuration
```

These directories are proposed, not included as runnable application code. There is no app startup command or live service in this documentation commit. Source publication, application implementation and production deployment are separate milestones.

## Rights and data separation

Keep source code independent of private workspace content. Upstream applications and dependencies retain their rights and licenses. No root software license has been selected by this research publication, and it does not relicense third-party code. Do not commit provider keys, local credentials, reference screenshots or personal exports.
