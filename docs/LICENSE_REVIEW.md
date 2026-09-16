# License and dependency review

Status: **documentary screening only; no pinned dependency audit or legal opinion**.

The source URLs below point to the versions/branches observed on 2026-09-15. Before installing or distributing code, record the exact commit/package version, lockfile entry, license text, notice requirements, extension terms and deployment restrictions. Do not assume a repository headline applies to every path.

| Candidate | Observed boundary | Decision |
|---|---|---|
| AFFiNE | Root license delegates backend and common/native paths to separate server terms; other covered content is MIT [S18,S19] | Do not blindly fork the entire repository as a MIT product |
| BlockSuite independent repository | Identifies MPL-2.0, with PageEditor/EdgelessEditor [S20] | Evaluate exact package and distribution obligations before adoption |
| tldraw SDK | Development-only default; production requires applicable license; not permissive open source [S21] | Commercial/hobby eligibility must be resolved, not bypassed |
| Excalidraw | Repository MIT; hosted-product functionality must be distinguished [S23,S24] | Optional sketch module after package audit |
| React Flow | Node/flow UI with separate examples/services; not a full whiteboard product [S22] | Optional diagram module, not default canvas |
| Tiptap | Open-source core; commercial extensions/services separate [S25] | Select exact extensions, avoid accidental paid dependencies |
| Konva | MIT framework [S27] | Primary canvas spike candidate |
| Sigma.js | Official project identifies MIT graph renderer [S30] | Graph spike candidate; pin stable version |
| Hocuspocus | Maintainer repository identifies MIT server [S32] | Sync-server spike candidate; validate chosen extensions |

A future application license applies only to code the project has rights to license. Preserve upstream notices and keep provider trademarks separate. Do not copy proprietary UI assets, logos, screenshots or internal code. This research bundle includes none of the user's reference screenshots.

## Required release evidence

1. Lockfile and supported runtime versions.
2. Per-package license inventory including transitive dependencies and fonts/icons.
3. SPDX-style license identifiers where unambiguous; manual review of custom/commercial terms.
4. Required notices shipped in source and distributed artifacts.
5. Dependency and secret scanning results, triage records and an SBOM.
6. Written decision for any reciprocal or non-permissive dependency.
7. Confirmation that public examples do not contain real user notes, credentials or private source assets.

No software license has been selected for the future application by this documentation package. No license keys or third-party approvals have been obtained.
