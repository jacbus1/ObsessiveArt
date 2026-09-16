import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { Store } from './store.mjs';
import { LIMITS } from '../public/model.mjs';
const hashPassword = promisify(scrypt);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = new Map([['/', ['index.html','text/html; charset=utf-8']], ['/app.mjs',['app.mjs','text/javascript; charset=utf-8']], ['/model.mjs',['model.mjs','text/javascript; charset=utf-8']], ['/markdown.mjs',['markdown.mjs','text/javascript; charset=utf-8']], ['/storage.mjs',['storage.mjs','text/javascript; charset=utf-8']], ['/styles.css',['styles.css','text/css; charset=utf-8']]]);
export function configuration(env = process.env) {
  const port = Number(env.PORT || 4173); const host = env.HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const url = new URL(env.PUBLIC_URL || `http://127.0.0.1:${port}`);
  const production = env.NODE_ENV === 'production'; const password = env.OBSESSART_PASSWORD || '';
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_URL must be an HTTP(S) origin');
  if (password && (password.length < 16 || password.length > 256)) throw new Error('Use an OBSESSART_PASSWORD of 16–256 characters');
  const loopbacks = ['127.0.0.1','localhost','::1','[::1]'];
  if ((!loopbacks.includes(host) || !loopbacks.includes(url.hostname) || production) && !password) throw new Error('A password is required outside local loopback mode');
  if (production && url.protocol !== 'https:') throw new Error('Production requires HTTPS PUBLIC_URL and a TLS reverse proxy');
  return { host, port, origin: url.origin, authority: url.host, secure: url.protocol === 'https:', password, dataFile: resolve(env.DATA_DIR || './data', 'obsessart.sqlite') };
}
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'JSON content type required');
  if (Number(req.headers['content-length'] || 0) > LIMITS.bytes + 10000) { req.resume(); throw new HttpError(413, 'Request too large'); }
  let length = 0; const chunks = [];
  for await (const chunk of req) { length += chunk.length; if (length > LIMITS.bytes + 10000) throw new HttpError(413, 'Request too large'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'Invalid JSON'); }
}
const tokenHash = token => createHash('sha256').update(token).digest('hex');
export async function createApp(config, store = new Store(config.dataFile)) {
  const salt = randomBytes(32);
  const passwordHash = config.password ? await hashPassword(config.password, salt, 64) : null;
  const sessions = new Map(); const failures = new Map(); let activeLogins = 0;
  const cookie = (value, age) => `obsessart_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${config.secure ? '; Secure' : ''}`;
  const sessionKey = req => tokenHash((req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('obsessart_session='))?.slice('obsessart_session='.length) || '');
  const authenticated = req => !passwordHash || (sessions.get(sessionKey(req)) || 0) > Date.now();
  const headers = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cache-Control': 'no-store'
  };
  if (config.secure) headers['Strict-Transport-Security'] = 'max-age=31536000';
  const server = http.createServer(async (req, res) => {
    Object.entries(headers).forEach(([k,v]) => res.setHeader(k,v));
    const send = (status, value) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(value)); };
    try {
      if (req.headers.host !== config.authority) throw new HttpError(403, 'Host not allowed');
      const path = new URL(req.url, config.origin).pathname;
      const method = req.method;
      if (path.startsWith('/api/')) {
        if (req.headers.origin && req.headers.origin !== config.origin) throw new HttpError(403, 'Origin not allowed');
        if (req.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Cross-site request denied');
        if (!['GET','HEAD'].includes(method) && (req.headers.origin !== config.origin || req.headers['x-obsessart-request'] !== '1')) throw new HttpError(403, 'Same-origin request header required');
      }
      if (path === '/healthz' && method === 'GET') return send(200, {status:'ok'});
      if (path === '/api/session' && method === 'GET') return send(200, { authenticated: authenticated(req), passwordRequired: Boolean(passwordHash) });
      if (path === '/api/login' && method === 'POST') {
        const now = Date.now();
        for (const [key, value] of failures) if (value.until < now) failures.delete(key);
        for (const [key, value] of sessions) if (value < now) sessions.delete(key);
        const ip = req.socket.remoteAddress; const attempt = failures.get(ip) || {count:0, until:now + 900000};
        if (attempt.count >= 8 || activeLogins >= 4 || failures.size >= 1000) throw new HttpError(429, 'Too many attempts. Try again later.');
        // Reserve the expensive-auth slot before reading the body; bound pending scrypt work.
        activeLogins++; attempt.count++; failures.set(ip,attempt);
        try {
          const data = await body(req);
          if (typeof data.password !== 'string' || data.password.length > 256) throw new HttpError(400, 'Invalid password');
          const accepted = !passwordHash || timingSafeEqual(await hashPassword(data.password, salt, 64), passwordHash);
          if (!accepted) throw new HttpError(401,'Incorrect password');
          failures.delete(ip);
          if (sessions.size >= 100) throw new HttpError(429, 'Too many active sessions. Restart the service to revoke sessions.');
          const token = randomBytes(32).toString('hex'); sessions.set(tokenHash(token), now + 43200000);
          res.setHeader('Set-Cookie',cookie(token,43200)); return send(200,{ok:true});
        } finally { activeLogins--; }
      }
      if (path.startsWith('/api/') && !authenticated(req)) throw new HttpError(401,'Sign in required');
      if (path === '/api/logout' && method === 'POST') { sessions.delete(sessionKey(req)); res.setHeader('Set-Cookie',cookie('',0)); return send(200,{ok:true}); }
      if (path === '/api/workspace' && method === 'GET') return send(200,store.read());
      if (path === '/api/workspace' && method === 'PUT') { const data = await body(req); return send(200,store.write(data.workspace,data.expectedRevision)); }
      if (path === '/api/backup' && method === 'GET') { res.setHeader('Content-Disposition','attachment; filename="obsessart-backup.json"'); return send(200,store.export()); }
      if (path === '/api/import' && method === 'POST') { const data = await body(req); return send(200,store.importBackup(data.backup,data.expectedRevision)); }
      if (path === '/api/history' && method === 'GET') return send(200,store.history());
      if (path === '/api/restore' && method === 'POST') {
        const data = await body(req); if (!Number.isSafeInteger(data.revision)) throw new HttpError(422,'Invalid revision');
        return send(200,store.write(store.read(data.revision).workspace,data.expectedRevision,'restore'));
      }
      if (method === 'GET' && assets.has(path)) {
        const [file,type] = assets.get(path); const bytes = await readFile(resolve(root,'public',file));
        res.writeHead(200,{'Content-Type':type}); res.end(bytes); return;
      }
      throw new HttpError(404,'Not found');
    } catch (error) {
      if (res.headersSent || res.destroyed) return;
      const status = error.status || 500;
      if (status >= 500) console.error(JSON.stringify({level:'error',event:'request_failed',name:error.name}));
      send(status,{error:status >= 500 ? 'Internal error; your change was not confirmed saved' : error.message});
    }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000; server.keepAliveTimeout = 5000; server.maxHeadersCount = 40;
  return { server, store };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = configuration(); const app = await createApp(config);
  app.server.listen(config.port,config.host,() => console.log(`ObsessArt: ${config.origin} — ${config.password ? 'password protected' : 'loopback-only personal mode'}`));
  const shutdown = () => { app.server.close(() => { app.store.close(); process.exit(0); }); app.server.closeIdleConnections(); setTimeout(() => process.exit(1), 10000).unref(); };
  process.once('SIGTERM',shutdown); process.once('SIGINT',shutdown);
}
