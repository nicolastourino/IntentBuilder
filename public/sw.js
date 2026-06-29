const CACHE='sail-v2';
const ASSETS=[
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sail-logo.png',
  './sail-color.png',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(r=>{
        if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
