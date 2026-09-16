# Primary-source register

Review cut-off: **2026-09-15**. All observations are documentary, not product execution. Repository branch URLs are mutable and are not dependency pins. The application design and test targets in this package are proposals.

## S01 — Obsidian: local data storage

Source: [Official help](https://help.obsidian.md/Files+and+folders/How+Obsidian+stores+data)

Observed: Markdown files in a local vault; caches are not the original note data.

Boundary: Documentation read; no application execution.

## S02 — Obsidian Canvas

Source: [Official product page](https://obsidian.md/canvas)

Observed: Canvas already provides spatial composition and embedded material.

Boundary: Feature description; no hands-on benchmark.

## S03 — Obsidian Bases

Source: [Official help](https://obsidian.md/help/bases)

Observed: Core database-like views over local files and properties.

Boundary: Current documentation; no importer tested.

## S04 — Obsidian shared-vault collaboration

Source: [Official help](https://obsidian.md/help/sync/collaborate)

Observed: Shared vaults are not live same-file coediting; fine-grained permissions are not currently supported.

Boundary: Only documented behavior evaluated.

## S05 — Obsidian terms

Source: [Official legal terms](https://obsidian.md/terms)

Observed: Using an application does not grant rights to redistribute its implementation.

Boundary: Not a legal opinion or complete licensing audit.

## S06 — JSON Canvas 1.0

Source: [Official specification](https://jsoncanvas.org/spec/1.0/)

Observed: Nodes, edges, coordinates, text/file/link/group objects; useful interchange subset.

Boundary: Specification read; no round-trip execution.

## S07 — Heptabase fundamental elements

Source: [Official product wiki](https://wiki.heptabase.com/fundamental-elements)

Observed: Cards are independent of whiteboards; one card may appear on multiple boards.

Boundary: Conceptual and documented behavior, not measured.

## S08 — Heptabase public roadmap

Source: [Official roadmap](https://wiki.heptabase.com/roadmap)

Observed: Page states last updated 2026-09-14; shipped CLI/MCP, AI, mobile and database changes are distinct from internal testing.

Boundary: A roadmap entry is not independent verification. Mini map is listed as internal testing, not shipped.

## S09 — Heptabase CLI

Source: [Official help](https://support.heptabase.com/en/articles/14715462-how-to-use-heptabase-cli)

Observed: CLI 0.6.0 documented; PDF highlight source anchors are not exposed by CLI and require full-account export.

Boundary: No CLI command or user export was run/read.

## S10 — Heptabase AI workflow

Source: [Official product wiki](https://wiki.heptabase.com/work-with-ai)

Observed: Source-context AI, citations and reuse of generated content are already product features.

Boundary: No model-quality evaluation.

## S11 — Heptabase collaboration

Source: [Official product wiki](https://wiki.heptabase.com/collaborate-and-discuss-with-others)

Observed: Shared cards and whiteboards are already supported.

Boundary: No simultaneous-editing test.

## S12 — Heptabase terms

Source: [Official legal terms](https://heptabase.com/terms_of_service)

Observed: Software and branding remain subject to provider intellectual-property terms.

Boundary: No permission to copy implementation or branding inferred.

## S13 — Heptabase data safety

Source: [Official help](https://support.heptabase.com/en/articles/10448141-is-my-data-safe-in-heptabase)

Observed: Provider describes transport and at-rest protection.

Boundary: Transport/at-rest protection must not be represented as end-to-end encryption.

## S14 — Miro Web SDK introduction

Source: [Official developer documentation](https://developers.miro.com/docs/miro-web-sdk-introduction)

Observed: SDK extends the Miro environment; it is not the Miro application as a self-hostable SDK.

Boundary: No Miro account, API or export accessed.

## S15 — Miro board items

Source: [Official developer documentation](https://developers.miro.com/docs/board-items)

Observed: Not all native item types and operations are exposed through SDK/REST.

Boundary: Exact importer support requires representative fixtures and current API contracts.

## S16 — Miro board export

Source: [Official help](https://help.miro.com/hc/en-us/articles/360017572754-How-to-export-your-board)

Observed: Visual exports differ from editable structured interchange.

Boundary: No exported file inspected.

## S17 — Miro getting started FAQ

Source: [Official product guide](https://miro.com/how-to-use-miro/)

Observed: Real-time collaboration requires internet; mobile offline viewing is described.

Boundary: Do not turn this into an unsupported universal claim of full offline editing.

## S18 — AFFiNE root license

Source: [Maintainer repository license](https://github.com/toeverything/AFFiNE/blob/canary/LICENSE)

Observed: Backend and common/native paths defer to another license; other covered portions use MIT.

Boundary: Live canary branch observed, not a pinned-release legal audit.

## S19 — AFFiNE server license

Source: [Maintainer repository license](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/LICENSE)

Observed: Server path has separate license terms.

Boundary: Assess exact version, paths and intended distribution before adopting.

## S20 — BlockSuite independent repository

Source: [Maintainer repository](https://github.com/toeverything/blocksuite)

Observed: Page and edgeless editors share editing infrastructure; independent repository identifies MPL-2.0.

Boundary: Do not extend this license statement to every release or monorepo package without checking.

## S21 — tldraw SDK licensing

Source: [Official SDK documentation](https://tldraw.dev/community/license)

Observed: Default development-only terms; production needs an applicable trial/commercial/hobby license.

Boundary: Pricing and eligibility are not guaranteed; no license obtained.

## S22 — React Flow whiteboard guidance

Source: [Official SDK documentation](https://reactflow.dev/learn/advanced-use/whiteboard)

Observed: Flow/node UI focus; whiteboard examples do not make it a complete general whiteboard engine.

Boundary: No performance or integration test.

## S23 — Excalidraw repository

Source: [Maintainer repository](https://github.com/excalidraw/excalidraw)

Observed: MIT drawing editor; useful as a sketch module candidate.

Boundary: Do not assume all hosted-app capabilities come with the embeddable package.

## S24 — Excalidraw self-hosting development guide

Source: [Official documentation](https://docs.excalidraw.com/docs/introduction/development)

Observed: Documented self-hosting distribution does not automatically include sharing/collaboration.

Boundary: No Docker image built.

## S25 — Tiptap editor overview

Source: [Official SDK documentation](https://tiptap.dev/docs/editor/getting-started/overview)

Observed: Open-source editor core and separately offered extensions/services.

Boundary: Audit exact installed packages; do not assume all extensions are MIT.

## S26 — Tiptap Markdown

Source: [Official SDK documentation](https://tiptap.dev/docs/editor/markdown)

Observed: Bidirectional Markdown extension remains labeled Beta on the page read.

Boundary: Obsidian dialect fidelity is not implied.

## S27 — Konva

Source: [Official SDK site](https://konvajs.org/)

Observed: MIT 2D canvas framework candidate.

Boundary: Framework choice is proposed, not validated in this application.

## S28 — Konva DOM portal

Source: [Official SDK documentation](https://konvajs.org/docs/react/DOM_Portal.html)

Observed: HTML overlays are not included in canvas export.

Boundary: Unified export rendering is a required application responsibility.

## S29 — Konva performance guidance

Source: [Official SDK documentation](https://konvajs.org/docs/performance/All_Performance_Tips.html)

Observed: Viewport, draw cost, layers and interaction affect performance.

Boundary: No throughput or frame-rate claim is made.

## S30 — Sigma.js

Source: [Official SDK site](https://www.sigmajs.org/)

Observed: WebGL graph visualization with Graphology integration.

Boundary: Exact stable package version must be pinned; no graph benchmark run.

## S31 — Yjs offline editing

Source: [Official SDK documentation](https://docs.yjs.dev/getting-started/allowing-offline-editing)

Observed: IndexedDB persistence can be combined with a network provider.

Boundary: Not a guarantee of application-level durability or authorization.

## S32 — Hocuspocus repository

Source: [Maintainer repository](https://github.com/ueberdosis/hocuspocus)

Observed: MIT self-hostable collaboration-server candidate.

Boundary: No server installed or operated.

## S33 — Hocuspocus hooks

Source: [Official SDK documentation](https://tiptap.dev/docs/hocuspocus/server/hooks)

Observed: Authentication and connection handling hooks support application-specific authorization.

Boundary: Application ACL, revocation and durable-ack behavior still need implementation and tests.

## S34 — PDF.js

Source: [Official project site](https://mozilla.github.io/pdf.js/)

Observed: PDF rendering infrastructure candidate.

Boundary: Source-anchor preservation is an application feature, not assumed from PDF rendering.

## S35 — Browser storage quotas and eviction

Source: [MDN platform documentation](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

Observed: Browser storage may be evicted or deleted; persistent storage requests are not a full backup strategy.

Boundary: Test target browser/device behavior before release.

## S36 — GitHub Pages

Source: [Official hosting documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Observed: Static hosting does not run the proposed database and synchronization backend.

Boundary: No GitHub Pages deployment performed.

## S37 — WebSocket security

Source: [OWASP guidance](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)

Observed: Origin/session checks, message authorization, bounds and safe logging are relevant.

Boundary: Security checklist, not a security certification.

## S38 — SSRF prevention

Source: [OWASP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

Observed: Remote-content fetching requires destination and redirect controls.

Boundary: No penetration test performed.
