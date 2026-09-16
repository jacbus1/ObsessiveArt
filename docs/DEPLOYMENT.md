# Deployment and recovery

## Local personal use

Run `npm start`, then open exactly `http://127.0.0.1:4173`. The default Host check intentionally does not accept arbitrary hostnames. Set PUBLIC_URL explicitly when using a different browser origin. Keep the local service running; this version is not a static-only site or an installed offline PWA.

Runtime configuration is read from the environment or an optional root `.env` file. Copy `.env.example` and edit it. Never commit `.env`. A password must have 16–256 characters; generate a unique high-entropy value outside shell command history. The service hashes it for authentication and never includes it in workspace exports.

## Self-hosted beta behind TLS

These files are deployment templates, not proof of a completed deployment. The container uses an unprivileged user and a persistent named volume. Docker/TLS deployment was not executed in the initial environment.

Set a real domain and certificate on a TLS reverse proxy. Example environment:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=4173
PUBLIC_URL=https://notes.example.com
OBSESSART_PASSWORD=replace-with-a-unique-long-secret
```

Do not use the example password. Compose requires an explicit password and URL:

```bash
docker compose up --build -d
```

The compose port binds only to the host's `127.0.0.1`. Run a TLS reverse proxy on that host, preserving the incoming Host header. Example Caddy fragment:

```caddyfile
notes.example.com {
    reverse_proxy 127.0.0.1:4173
}
```

PUBLIC_URL must match the browser origin, including any nonstandard port. Do not trust or use forwarded headers from arbitrary clients to bypass this check. Configure perimeter rate limits, a request-body limit of approximately 2 MB, restricted network access and monitoring. Sessions expire after 12 hours and are invalidated on restart. This is one owner account, not a permission model for a team.

Before a production release, lock the base image to a reviewed digest and rerun tests against the selected patched Node runtime. The provided `node:24-bookworm-slim` tag intentionally does not assert a verified image digest. No public URL has been deployed as part of this code submission.

## Back up

```bash
npm run backup
npm run backup -- /absolute/path/to/backup.sqlite
```

The script refuses an existing output path and uses SQLite online backup, including retained history. File mode is set to owner-only. Store a copy on a separate device or backup service and protect it as private content. Exports and backups are not encrypted by this application.

Native JSON export in the UI backs up the current workspace, not the history. JSON import explicitly replaces the current workspace. The last 50 snapshots can roll off quickly during editing; they are not disaster recovery.

## Restore a SQLite backup safely

1. Stop the application and prevent automatic restarts during recovery.
2. Move the entire existing DATA_DIR aside; do not mix an old WAL/SHM with a new main database file.
3. Create a fresh owner-only data directory. Copy the verified backup to `obsessart.sqlite` there and set owner-only permissions and correct service ownership.
4. Point DATA_DIR at that fresh directory and start the service.
5. Verify notes, links, positions, trash and history, then export a new native backup and compare important content. Keep the old directory until recovery is verified.

Use a separate directory/service for a restore drill; do not test by replacing the sole live copy. Container volume recovery requires equivalent ownership and a stopped app. Database schema versions newer than this application fail closed; rollbacks require restoring a compatible full backup, not opening a newer database with older code.

## Monitor

`GET /healthz` reports process health and still validates Host. Use `node scripts/healthcheck.mjs` inside the container. Monitor disk usage, backup age, process restarts, 5xx errors and repeated login failures externally. The UI surfaces save failure and conflicts; it does not provide uptime monitoring or a backup scheduler.
