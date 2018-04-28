const CACHE = 'network-or-cache';
const TIMEOUT = 500;
const FILES = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './grid.css',
  './linkbtn.png',
  './linktop.png',
];

// On install, cache some resource.
self.addEventListener('install', function(evt) {
  //console.log('The service worker is being installed.');

  // Ask the service worker to keep installing until the returning promise
  // resolves.
  evt.waitUntil(precache());
});

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener('fetch', function(evt) {
  //console.log('The service worker is serving the asset.');
  // Try network and if it fails, go for the cached copy.
  evt.respondWith(fromNetwork(evt.request, TIMEOUT).catch(function () {
    return fromCache(evt.request);
  }));
});

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(FILES);
  });
}

// Time limited network request. If the network fails or the response is not
// served before timeout, the promise is rejected.
function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    // Reject in case of timeout.
    var timeoutId = setTimeout(reject, timeout);
    // Fulfill and update in case of success.
    fetch(request).then(function (response) {
      //console.log('The service worker is serving from the network.');
      clearTimeout(timeoutId);

      fulfill(response);
      updateCache(request, response);
    // Reject also if network fetch rejects.
    }, reject);
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    //console.log('The service worker is updating the cache.');
    cache.put(request, response.clone());
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if(matching) {
        //console.log('The service worker is serving from the cache.');
        return matching;
      }
      //console.log('The service worker is serving from the cache but didn\'t find a match.');
      return fetch(request);
    });
  });
}
