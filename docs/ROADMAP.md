# Release gates and next work

## v0.1 personal core — implemented

Shared note identity; independent board placements and connectors; Markdown source/preview; internal links/backlinks; search; graph; trash; structural undo; responsive bilingual interface; SQLite revision checks; bounded history; native backup/import; owner-password mode; testable HTTP service.

## Before calling a personal release production-ready

- Run normal browser tests against the intended patched runtime; verify cookies, CSP and IndexedDB in real navigation.
- Add recovery tests for failed IndexedDB transactions, quota exhaustion, duplicate tabs, interrupted saves and expired sessions. Verify no false saved indicator.
- Test process termination immediately after acknowledged commits, disk-full conditions, malicious chunked uploads and interrupted backups.
- Build and run the container, validate TLS/proxy setup, pin reviewed base-image digest, verify restore drills in a clean environment and monitor backup freshness.
- Add accessibility review, Chinese IME composition/undo tests, Safari/Firefox and actual touch-device coverage.
- Measure cold start, memory, search and canvas performance with representative content; do not publish inferred benchmark claims.
- Complete independent security review and document the supported scale and threat model.

## Next capability milestones — not yet implemented

1. Attachments and source reading with reliable PDF page/region anchors, explicit storage/size policy and asset-aware backups.
2. Richer board tools: frames, freehand strokes, alignment, text objects and faithful image/PDF export.
3. Per-document persistence/synchronization and deliberate conflict recovery before real-time collaboration; roles, session revocation and access-isolated indexing before sharing.
4. A durable desktop/offline path, a tested service worker and safe file interchange with explicit lossy-conversion reports.
5. Optional AI provider adapter interface, selected-context prompts, source citations and reviewable change proposals. No provider calls or authentication automation are present now.

A merge of the initial PR accepts a development baseline. It is not approval for public service deployment or a declaration that the full roadmap is complete.
