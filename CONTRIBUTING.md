# Contributing

Use a feature branch and a pull request; do not commit runtime data. Read README.md, SECURITY.md and the architecture before changing storage behavior.

Run `npm run check`, `npm test` and the normal browser smoke suite. Describe exactly which checks executed and which were unavailable. Include a failing regression test with each data-loss, permission or import fix.

Keep content identity separate from placement identity. Never turn a visual arrow into a semantic relationship implicitly. Never resolve a stale write by blindly replacing the newer workspace. New schemas require explicit migration and backup/restore coverage.

English and Traditional Chinese entry documentation are separate. Product-facing materials describe ObsessArt's own behavior. Do not introduce competitor comparisons, copied marketing assets, private workspace content, credentials or claims about untested production readiness.

This initial implementation uses no runtime npm dependencies. Proposals to add dependencies must state the pinned version, license, maintenance impact and replacement/migration strategy. Browser and server validation must remain aligned.
