# Screenshot provenance and publication evidence

This directory contains actual ObsessiveArt UI screenshots captured in Chromium through ordinary HTTP navigation. These are not AI-generated artwork, mockups, screenshots of other products, or images from a private user workspace.

Each language has five views: canvas, split note editor, graph, data/settings and a mobile-width editor. The English screenshots use translations of the bundled synthetic notes, imported through the application's normal JSON restore interface. The Traditional Chinese screenshots use a fresh bundled sample workspace. Changing interface language does not automatically translate note content.

`capture.json` records the capture timestamp, source commit, browser version, viewport sizes, runtime source SHA-256 values and image SHA-256 values. All ten image hashes were checked against this manifest after downloading the workflow artifact. Desktop canvas, the Traditional Chinese split editor and the settings screen were also visually inspected. The mobile screenshots use a 390 × 844 browser viewport; they do not certify physical mobile devices.

## Verified runs

| Evidence | Result | Scope |
|---|---|---|
| [Application test and build](https://github.com/jacbus1/ObsessiveArt/actions/runs/35056783323) | Success | Syntax, core/security tests, static build and Chromium browser flow checks |
| [Screenshot generation](https://github.com/jacbus1/ObsessiveArt/actions/runs/35056783296) | Success | Real browser capture; ten images plus provenance committed to main |
| [GitHub Pages publication](https://github.com/jacbus1/ObsessiveArt/actions/runs/35056502522) | Success | Pre-publication application tests, deployment, then public HTML and core module checks over HTTP |

**Public application:** https://jacbus1.github.io/ObsessiveArt/

The Pages workflow verified the public URL from its GitHub-hosted runner. The post-deployment HTTP checks are not a complete browser E2E suite against the public URL. Screenshot generation and publication do not certify production security, cross-device synchronization, physical phones or large-scale performance.

## Reproduce

Start the application with `npm start` in a separate terminal, then run:

```sh
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tools/capture_readme.py
```

The `Publish README screenshots` workflow first runs syntax checks, core tests, build and the real browser regression suite. It captures both languages in disposable browser profiles, then commits only `docs/screenshots/` without force-pushing. The initial attempt failed because a saved-state CSS class contained harmless trailing whitespace; the assertion was corrected, and the successful run above generated the published images.

The root [English README](../../README.md) and [Traditional Chinese README](../../README.zh-Hant.md) each embed their corresponding five screenshots. A concurrent documentation update was preserved rather than overwritten while finalizing this publication.
