const cachename = "news-app-static";
var staticAssets = ['..\\','index.html',"..\\css\\style.css","..\\css\\bootstrap.min.css","..\\js\\bootstrap.min.js","..\\js\\jquery.min.js","..\\js\\sweetalert.js","..\\js\\news.js","..\\js\\script.js","..\\img\\image.png"]

self.addEventListener('install', async function() 
{
    const cache = await caches.open(cachename);
    cache.addAll(staticAssets);
});

self.addEventListener('activate',function(event)
{
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',function(event){
    req = event.request;
    const url = new URL(req.url);
    if(url.origin === location.origin)
    {
        event.respondWith(cacheFirst(req));
    }
    else
    {
        event.respondWith(networkFisrt(req));
    }
});

async function cacheFirst(request)
{
    res = await caches.match(request);
    return res || fetch(request);
}
async function networkFisrt(request)
{
    const dynamicCache = await caches.open('news-app-dynamic');
    try 
    {
        const networkResponse = await fetch(request);
        dynamicCache.put(request, networkResponse.clone());
        return networkResponse;
    } 
    catch (err) 
    {
        const cachedResponse = await dynamicCache.match(request);
        return cachedResponse || await caches.match('..\\news-pwa\\fallback.json');
    }
}