// src/middleware/cloudflare-cache.ts
import type { MiddlewareHandler } from 'astro';

/**
 * Middleware that implements Cloudflare caching for Astro SSR pages
 * This uses the Cloudflare Cache API directly for better control
 */
export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {

  console.log('Cache middleware executed');

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return next();
  }

  // Skip caching for API routes and asset URLs
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') ||
      url.pathname.includes('/cdn-cgi/') ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
    return next();
  }

  // Check if we're in a Cloudflare environment
  // @ts-expect-error - Cloudflare specific global
  const cache = globalThis.caches?.default;

  if (!cache) {
    console.log('Cache API not available, skipping cache middleware');
    return next();
  }

  // Create a cache key from the request URL
  const cacheKey = new Request(url.toString(), {
    method: 'GET',
    headers: request.headers
  });

  try {
    // Try to get from cache first
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      console.log(`Cache HIT for ${url.pathname}`);
      return cachedResponse;
    }
  } catch (error) {
    console.error('Cache match error:', error);
  }

  // Get the response from Astro
  const response = await next();

  // Only cache successful responses with appropriate status codes
  if (response.status === 200 && cache) {
    try {
      // Clone the response before putting it in the cache
      const responseToCache = new Response(response.body, response);

      // Make sure cache headers are set
      if (!responseToCache.headers.has('Cache-Control')) {
        responseToCache.headers.set(
          'Cache-Control',
          'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
        );
        responseToCache.headers.set('CDN-Cache-Control', 'public, max-age=300');
        responseToCache.headers.set('Surrogate-Control', 'public, max-age=300');
        responseToCache.headers.set('Mariano-test', '12345');
      }

      // Store in Cloudflare's cache
      // @ts-expect-error - Cloudflare specific API
      locals.waitUntil?.(cache.put(cacheKey, responseToCache.clone()));
      console.log(`Cached ${url.pathname}`);

      return responseToCache;
    } catch (error) {
      console.error('Cache put error:', error);
    }
  }

  return response;
};
