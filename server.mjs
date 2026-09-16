import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=new Set(['index.html','style.css','manifest.webmanifest','sw.js','assets/icon.svg','src/app.js','src/core.js','src/storage.js']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
 try{
  const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if(name==='healthz'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok',version:'0.1.0'}));return;}
  if(name==='')name='index.html';
  if(!allowed.has(name)){res.writeHead(404);res.end('Not found');return;}
  const file=path.join(root,name),data=await readFile(file),info=await stat(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(400);res.end('Bad request');}
});
server.listen(port,host,()=>console.log(`ObsessiveArt v0.1.0 → http://${host}:${port}\nLocal-only data. Keep regular JSON backups. Ctrl+C to stop.`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
