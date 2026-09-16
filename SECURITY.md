# Security and privacy

## Supported scope

v0.1 is a single-user browser-local application, not a multi-tenant SaaS or collaboration server. The static host never receives note content through application APIs. Browser-managed storage is not application-encrypted and is accessible to scripts on the same origin. Host the application on a dedicated, trusted HTTPS origin; compromise of that origin or a privileged browser extension can compromise notes. A public repo does not itself expose users' IndexedDB content.

## Implemented controls

- Raw HTML in Markdown is escaped. No eval, dynamic script loading or unsanitized note HTML.
- External Markdown links allow only explicit HTTP, HTTPS and mailto URLs; external image fetching is not supported.
- CSP restricts scripts, network and workers to the same origin. Inline styles are allowed for canvas positions; inline scripts are not. The Node server adds frame-ancestors, nosniff, no-referrer and feature restrictions.
- Attachments allow PNG/JPEG/GIF/WebP/PDF with an 8 MiB limit. Actual uploads check signatures; SVG/HTML are refused. PDF is an attachment download, not parsed by the app. Treat downloaded files as untrusted.
- Native import validates schema, IDs, geometry, reference integrity and size limits, then projects an allowlisted model. Unknown fields are discarded. ZIP import is intentionally absent.
- IndexedDB compare-and-swap rejects stale revisions atomically. A completed storage transaction is required before showing saved. A previous committed state is retained for recovery.
- Write/read failures never silently reset the database. The app stops saving and provides export/recovery paths. The service worker caches app assets only.
- No runtime npm packages, telemetry, remote font files, account tokens, AI secrets or embedded API keys.

## Limits

No audit/certification, end-to-end encryption, authentication, server-side RBAC, remote wipe, synchronization, malware scanner or automated external backups. Manual recovery copies share the same device failure domain. A background update cannot recover previously cleared browser data. High availability and million-object scale have not been tested.

Do not store sensitive regulated information without evaluating the deployment origin, endpoint/browser security, backup process and applicable organizational requirements. Do not post private notes or backups in a public GitHub issue. For a vulnerability report, use GitHub private vulnerability reporting when the repository owner has enabled it; otherwise contact the owner privately before sharing details.
