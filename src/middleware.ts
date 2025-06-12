const cachingMiddleware = async (
  { request }: { request: Request },
  next: () => Promise<Response>,
) => {
  // Only apply caching logic for GET requests
  if (request.method !== 'GET') {
    console.log(`Cache middleware - SKIPPING (Method: ${request.method})`);
    return await next();
  }

  // caches.default is only available on cloudflare workers
  // other platforms implementing the Web Cache API require using the `open` method
  // `const cache = await caches.open("default")`
  const cache = (caches as any).default as Cache;

  const cachedResponse = await cache.match(request);

  // return the cached response if there was one
  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    const cacheTime = headers.get('X-Cache-Time');
    let age = 0;
    if (cacheTime) {
      const now = Math.floor(Date.now() / 1000);
      age = now - parseInt(cacheTime, 10); // Ensure base 10
      if (age < 0) age = 0; // Handle potential clock skew
    }
    headers.set('Age', age.toString());
    console.log("Cache middleware - HIT (Age: " + age + " seconds)");
    // Optionally, remove X-Cache-Time from client-facing headers
    // headers.delete('X-Cache-Time');

    if (!cachedResponse.body) {
      // Handle cached responses without a body (e.g., 204, 304 from cache)
      return new Response(null, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers, // Headers now include 'Age'
      });
    }

    // For cached responses with a body, use .tee()
    const [body1, _body2] = cachedResponse.body.tee();
    return new Response(body1, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers, // Headers now include 'Age'
    });
  } else {
    // render a fresh response
    const response = await next();
    console.log("Cache middleware - MISS - Status: " + response.status);

    if (response.status === 404) {
      // Handle 404 responses specifically
      let bodyFor404Cache = null;
      let bodyFor404Client = null;

      if (response.body) {
        [bodyFor404Cache, bodyFor404Client] = response.body.tee();
      }

      const responseHeadersForCache = new Headers(response.headers);
      // Override or set Cache-Control for 404s to be cached for 10 minutes
      responseHeadersForCache.set('Cache-Control', 'public, max-age=600');
      const nowFor404 = Math.floor(Date.now() / 1000);
      responseHeadersForCache.set('X-Cache-Time', nowFor404.toString());

      const responseToCache404 = new Response(bodyFor404Cache, {
        status: 404,
        statusText: response.statusText,
        headers: responseHeadersForCache,
      });
      await cache.put(request, responseToCache404);

      // Return the original 404 response to the client (with its original headers and body stream)
      return new Response(bodyFor404Client, {
        status: 404,
        statusText: response.statusText,
        headers: response.headers, // Client gets original headers from the 404 response
      });
    } else {
      // Existing logic for non-404 responses
      if (!response.body) {
        // Handle responses without a body (e.g., 204, 304, HEAD requests)
        const responseHeadersForCache = new Headers(response.headers);
        const now = Math.floor(Date.now() / 1000);
        responseHeadersForCache.set('X-Cache-Time', now.toString());
        const responseToCache = new Response(null, { // body is null
          status: response.status,
          statusText: response.statusText,
          headers: responseHeadersForCache,
        });
        await cache.put(request, responseToCache);
        return response; // Return the original response, its body (null) is safe
      }

      // For responses with a body, use .tee()
      const [bodyForCache, bodyForClient] = response.body.tee();
      const responseHeadersForCache = new Headers(response.headers);
      const now = Math.floor(Date.now() / 1000);
      responseHeadersForCache.set('X-Cache-Time', now.toString());

      const responseToCache = new Response(bodyForCache, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeadersForCache,
      });
      await cache.put(request, responseToCache);

      // Return a new response with the other body stream to the client
      return new Response(bodyForClient, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers, // Client gets original headers
      });
    }
  }
};

export const onRequest =
  // avoid using caches when it is not available. for example, when testing locally with node
  typeof globalThis.CacheStorage === 'function' && globalThis.caches instanceof globalThis.CacheStorage
    ? cachingMiddleware
    : // a middleware that does nothing
      (_: any, next: any) => next();