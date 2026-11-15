const CACHE='propline-v24';
const SHELL=['./','index.html','app.js','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// network first for the page, the app and the account data; the last good copy is used offline
const netFirst=(r,key)=>fetch(r).then(res=>{ if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(key||r,c));} return res; }).catch(()=>caches.match(key||r).then(m=>m||Response.error()));
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url); if(r.method!=='GET'||u.origin!==location.origin) return;
  if(r.mode==='navigate') e.respondWith(netFirst(r,'index.html'));
  else if(u.pathname==='/app.js'||u.pathname==='/api/data.js'||u.pathname==='/api/me') e.respondWith(netFirst(r));
  else if(u.pathname.startsWith('/api/')) return;
  else e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res})));
});
