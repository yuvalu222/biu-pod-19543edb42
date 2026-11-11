const SHELL='shell-202611111932';
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(['./','index.html','manifest.json','icon.svg','icon-192.png','icon-512.png','icon-180.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('shell-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function fromPods(req){
  const url=new URL(req.url); url.search='';
  const c=await caches.open('pods'); const hit=await c.match(url.href);
  if(!hit)return null;
  const range=req.headers.get('range');
  if(!range)return hit;
  const buf=await hit.arrayBuffer(); const size=buf.byteLength;
  const m=/bytes=(\d*)-(\d*)/.exec(range)||[]; let s=m[1]?parseInt(m[1]):0; let e=m[2]?parseInt(m[2]):size-1; if(e>=size)e=size-1;
  return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mp4','Content-Range':`bytes ${s}-${e}/${size}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.includes('/audio/')){e.respondWith(fromPods(e.request).then(r=>r||fetch(e.request)));return}
  if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(SHELL).then(c=>c.put('index.html',cp));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
