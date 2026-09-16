/* Cache ONLY this app's static shell. IndexedDB user data is not in this cache.
   No skipWaiting: a new shell becomes active after existing tabs close, avoiding
   an old app/new module mismatch. No network requests for user content. */
const CACHE='obsessiveart-shell-v0.1.0';
const FILES=['./','./index.html','./style.css','./src/app.js','./src/core.js','./src/storage.js','./assets/icon.svg','./manifest.webmanifest'];
const urls=new Set(FILES.map(f=>new URL(f,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(f=>new URL(f,self.registration.scope).href)))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('obsessiveart-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);url.search='';
 if(!urls.has(url.href))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{const stored=await cache.match(url.href);if(stored)return stored;return fetch(event.request);}));
});
