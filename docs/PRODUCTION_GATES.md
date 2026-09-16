# Production release gates

**Every application case below is NOT RUN.** This document and its JSON companion are requirements, not an executable test suite or evidence of passed tests.

## Release policy

No 1.0/production-ready claim before blocking functionality, persistence, isolation, safety, recovery and usability cases pass on the actual release artifact. Performance numbers below are proposed targets for a declared fixture, not measured claims. A failed or waived gate must remain visible with owner, rationale, risk and release impact. Do not rename a beta to production to avoid failed tests.

Minimum evidence per run: git commit, lockfile hash, runtime/container image identifiers, OS/browser/device profile, fixture checksum, network profile, command or test-run link, timestamp, result and relevant redacted logs/screenshots. Include at least one clean-machine deployment and restore run.

## Suggested CI and release layers

Fast checks: formatting, lint, TypeScript, domain invariants and versioned serialization fixtures. Integration: real database, WebSocket auth and durability, worker retry/cleanup, source permissions and archive validation. Browser: Chromium/Firefox/WebKit, CJK composition where automation permits plus real-device manual testing. Release qualification: load, crash/reconnect fault injection, dependency/license/secret scans and independent backup restore. Do not represent mocked storage tests as real persistence tests.

## Proposed cases

| ID | Area | Case | Expected result | Status |
|---|---|---|---|---|
| D01 | Domain | One note, multiple placements | Both views show the same note revision; no duplicated canonical body. | NOT RUN |
| D02 | Domain | Remove placement only | The note, other placement and knowledge relations remain intact. | NOT RUN |
| D03 | Domain | Explicit independent duplicate | A new note ID exists; its content no longer follows the original. | NOT RUN |
| D04 | Domain | Rename and duplicate titles | Stable-ID links remain correct; ambiguous imported titles are reported. | NOT RUN |
| D05 | Domain | Visual vs semantic edges | Only the explicit relation enters the semantic graph; source evidence is preserved. | NOT RUN |
| D06 | Domain | Graph layout isolation | Manually arranged board coordinates remain unchanged. | NOT RUN |
| D07 | Domain | Trash reference behavior | Clear tombstone state, no accidental resurrection; restore preserves references. | NOT RUN |
| E01 | Editing | Chinese IME composition | No duplicated/dropped composition text; caret and committed content match. | NOT RUN |
| E02 | Editing | Collaborative undo | Other user changes remain; undo behavior matches the declared policy. | NOT RUN |
| E03 | Editing | Schema mismatch | Safe refusal or documented migration; no silent content loss. | NOT RUN |
| E04 | Editing | Keyboard alternative | All critical actions available through focusable controls/list alternatives. | NOT RUN |
| S01 | Sync | Two-device offline merge | Document state converges under the declared semantic conflict policies. | NOT RUN |
| S02 | Sync | Duplicate/out-of-order updates | No duplicated content/commands; consistent final state. | NOT RUN |
| S03 | Sync | Crash after durable receipt | Every acknowledged committed update survives the tested failure. | NOT RUN |
| S04 | Sync | Storage failure before receipt | No false server-saved state; locally persisted pending edits remain recoverable. | NOT RUN |
| S05 | Sync | Cross-document partial failure | Recovery completes or compensates deterministically without hidden orphan state. | NOT RUN |
| S06 | Sync | Offline edit after revocation | Server rejects unauthorized writes; local content is quarantined/exportable with clear messaging. | NOT RUN |
| S07 | Sync | Old offline client and tombstones | No unapproved resurrection; controlled resync or recovery path. | NOT RUN |
| O01 | Offline | Restart offline | Available content reopens; unavailable assets are labeled, never represented as loaded. | NOT RUN |
| O02 | Offline | Quota/persistence error | Visible save failure, recovery/export path and no false local-saved status. | NOT RUN |
| O03 | Offline | Account cache isolation | No cross-account cache access; unsynced-edit handling follows explicit user choice. | NOT RUN |
| A01 | Authorization | Viewer cannot write | Server denies writes even if frontend controls are modified. | NOT RUN |
| A02 | Authorization | Cross-workspace identifiers | All entry points deny access; no body/title/thumbnail/metadata leaks. | NOT RUN |
| A03 | Authorization | Revoked live session | Access blocked within declared revocation policy; active connections handled. | NOT RUN |
| A04 | Authorization | Search/export/AI filtering | No unauthorized text, filenames, counts, backlinks or citations disclosed. | NOT RUN |
| A05 | Authorization | Forged awareness identity | Server identity remains authoritative in UI and logs. | NOT RUN |
| I01 | Interchange | Obsidian supported subset | Documented subset preserved; unsupported syntax reported and retained appropriately. | NOT RUN |
| I02 | Interchange | Native archive round trip | IDs, content, geometry, relations, source anchors and asset hashes match the contract. | NOT RUN |
| I03 | Interchange | Corrupt/truncated archive | Safe rejection; no untracked partially visible workspace. | NOT RUN |
| I04 | Interchange | Miro unsupported types | No silent skipping; unsupported report and readable fallback are accurate. | NOT RUN |
| I05 | Interchange | Heptabase missing anchors | No invented source mapping; migration is marked incomplete for those anchors. | NOT RUN |
| I06 | Interchange | Repeat/cancel import | Idempotent outcomes, consistent visibility and documented cleanup. | NOT RUN |
| P01 | Provenance | Changed source file | Old anchors remain tied to old hash or are marked stale; no silent reassignment. | NOT RUN |
| P02 | Provenance | Quote vs generated interpretation | Type and provenance distinguish all three; only evidence-backed links marked verified. | NOT RUN |
| X01 | Security | HTML/SVG injection | No script execution or credential exfiltration; safe supported fallback. | NOT RUN |
| X02 | Security | Archive traversal and bombs | Bounded, safe rejection and no writes outside staging. | NOT RUN |
| X03 | Security | SSRF and redirects | Destination/redirect controls reject forbidden requests under the declared egress policy. | NOT RUN |
| X04 | Security | WebSocket origin/rate/size | Connection/message checks and resource bounds enforced. | NOT RUN |
| X05 | Security | Secrets and audit logs | No secrets or private bodies in bundles, logs or public fixtures. | NOT RUN |
| R01 | Recovery | Independent backup restore | Counts, hashes, references and measured recovery time/point are recorded. | NOT RUN |
| R02 | Recovery | Upgrade failure recovery | Supported recovery process restores access without silent data destruction. | NOT RUN |
| V01 | Visual | HTML overlay export | No missing card bodies; alignment, wrapping and supported text remain correct. | NOT RUN |
| V02 | Visual | Coordinate alignment | Pointer hit-testing, editor overlays, selection and export share consistent positions. | NOT RUN |
| V03 | Visual | Mobile touch workflow | No accidental destructive gestures; keyboard and focus remain usable. | NOT RUN |
| L01 | Load | 10,000-note search fixture | Proposed warm-search p95 <= 300 ms; report all measurements and indexing assumptions. | NOT RUN |
| L02 | Load | Desktop 1,000-object board | Proposed sustained >=30 fps during defined interaction; report p95 frame time/memory, not just averages. | NOT RUN |
| L03 | Load | Mobile 250-object board | Functional interaction without crashes; record memory/latency before setting a shipping threshold. | NOT RUN |
| L04 | Load | Ten collaborators | Proposed p95 visible propagation <=500 ms; consistency and durable receipts separately verified. | NOT RUN |
| AI01 | AI | Prompt injection and action approval | No expanded permissions or automatic commands; only approved scoped edits can commit. | NOT RUN |
| AI02 | AI | Unconfigured provider and limits | Core app remains functional; proposal state and billed/unknown usage are honest. | NOT RUN |

## Deployment-specific decisions still required

Reference hardware and supported browsers; maximum document/update/archive/asset sizes; authentication provider/session policy; rate limits; update compaction and history retention; offline-client compatibility window; backup retention and encryption; acceptable recovery point/time; administrative recovery procedures; supported concurrent editors; and incident ownership.

Production is a supported operational boundary backed by evidence. It is not synonymous with a polished screenshot, a public repository, a Dockerfile or a green unit-test badge.
