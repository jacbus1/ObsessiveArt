# Security policy and threat model

ObsessArt v0.1 is a single-owner personal beta. Do not use it as a multi-tenant service or the only copy of sensitive information. No independent security audit or production certification has been completed.

Default mode binds to 127.0.0.1 with strict Host/Origin checks. It assumes a trusted local machine; other local processes and local users are outside this protection boundary. Set an owner password to require sign-in. Production mode requires both a password and HTTPS PUBLIC_URL behind a TLS reverse proxy.

Implemented controls include schema validation, request size bounds, parameterized SQLite statements, optimistic concurrency, a static asset allowlist, escaped Markdown, no remote image embeds, Host/Origin and application-header checks, scrypt password comparison, bounded authentication work, login rate limiting and HttpOnly SameSite sessions. HTTPS configuration adds Secure cookies and HSTS. These controls are tested in the scopes described in docs/TEST_REPORT.md; they are not claims of comprehensive security.

There is no end-to-end encryption, encrypted local database, MFA, role model, tenant isolation or secure erasure guarantee. Browser recovery drafts and server backups contain readable private content. Logging out clears the current tab's draft and invalidates its session, but cannot recall exported data or guarantee erasure from other already-rendered tabs, browser profiles or OS backups. Use a trusted browser profile and close other tabs on shared machines.

Do not commit `.env`, database/WAL/SHM files, exports, logs or real workspace data. The supplied examples and tests are fictional. Never attach credentials or private backups to public issues. Report sensitive vulnerabilities privately to the repository owner; publish only a non-sensitive description after coordinated handling.

Before Internet deployment, independently verify TLS, proxy/Host behavior, normal-browser CSP and cookies, disk permissions, resource limits, backups and recovery. The image template and workflow are not evidence of a completed deployment.
