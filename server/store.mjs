import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { validateWorkspace, starterWorkspace, InputError } from '../public/model.mjs';
export const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export class ConflictError extends Error { constructor() { super('A newer revision exists. Export your draft before reloading.'); this.status = 409; } }
export class Store {
  constructor(filename, initial = starterWorkspace()) {
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(filename);
    if (filename !== ':memory:') chmodSync(filename, 0o600);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
    const version = this.db.prepare('PRAGMA user_version').get().user_version;
    if (version > 1) { this.db.close(); throw new Error('Database schema is newer than this application'); }
    this.db.exec(`CREATE TABLE IF NOT EXISTS snapshots (
      revision INTEGER PRIMARY KEY, payload TEXT NOT NULL, created_at TEXT NOT NULL, kind TEXT NOT NULL
    ); PRAGMA user_version=1;`);
    if (!this.db.prepare('SELECT revision FROM snapshots LIMIT 1').get()) {
      this.db.prepare('INSERT INTO snapshots VALUES (0, ?, ?, ?)').run(JSON.stringify(validateWorkspace(initial)), new Date().toISOString(), 'initial');
    }
    validateWorkspace(this.read().workspace);
  }
  read(revision) {
    const row = revision === undefined ? this.db.prepare('SELECT * FROM snapshots ORDER BY revision DESC LIMIT 1').get() : this.db.prepare('SELECT * FROM snapshots WHERE revision = ?').get(revision);
    if (!row) { const e = new Error('Revision not found'); e.status = 404; throw e; }
    return { revision: row.revision, savedAt: row.created_at, workspace: JSON.parse(row.payload) };
  }
  write(workspace, expectedRevision, kind = 'edit') {
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new InputError('Expected revision is required');
    const clean = validateWorkspace(workspace);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const current = this.read();
      if (current.revision !== expectedRevision) throw new ConflictError();
      if (clean.id !== current.workspace.id) throw new InputError('Workspace identity cannot change during an edit');
      const revision = current.revision + 1; const savedAt = new Date().toISOString();
      this.db.prepare('INSERT INTO snapshots VALUES (?, ?, ?, ?)').run(revision, JSON.stringify(clean), savedAt, kind);
      this.db.prepare('DELETE FROM snapshots WHERE revision < ?').run(Math.max(0, revision - 49));
      this.db.exec('COMMIT');
      return { revision, savedAt };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  history() { return this.db.prepare('SELECT revision, created_at AS savedAt, kind FROM snapshots ORDER BY revision DESC').all(); }
  export() { const {workspace} = this.read(); return { format: 'obsessart-backup', formatVersion: 1, exportedAt: new Date().toISOString(), sha256: digest(workspace), workspace }; }
  importBackup(value, expectedRevision) {
    if (!value || value.format !== 'obsessart-backup' || value.formatVersion !== 1 || value.sha256 !== digest(value.workspace)) throw new InputError('Invalid backup format or checksum');
    const clean = validateWorkspace(value.workspace);
    // Import into this workspace; retain stable note, board and placement identities.
    clean.id = this.read().workspace.id;
    return this.write(clean, expectedRevision, 'import');
  }
  async backupTo(filename) { await backup(this.db, filename); chmodSync(filename, 0o600); }
  close() { this.db.close(); }
}
