// src/middleware.ts
// This is a root-level middleware file that Astro will automatically detect

import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {
  console.log('Root middleware executed');

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return next();
  }

  // Skip caching for API routes and asset URLs
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') ||
      url.pathname.includes('/cdn-cgi/') ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
    // Let Cloudflare handle image optimization requests directly
    if (url.pathname.startsWith('/cdn-cgi/image/')) {
      return fetch(request);
    }
    return next();
  }

  // Check if we're in a Cloudflare environment
  // @ts-expect-error - Cloudflare specific global
  const cache = globalThis.caches?.default;

  if (cache) {
    try {
      // Create a cache key from the request URL
      const cacheKey = new Request(url.toString(), {
        method: 'GET',
        headers: request.headers
      });

      // Try to get from cache first
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        console.log(`Cache HIT for ${url.pathname}`);
        return cachedResponse;
      }

      // Get the response from Astro
      const response = await next();
      
      // Add debug headers to verify middleware execution
      // Create a new response with Cloudflare-specific cache directives
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        // @ts-expect-error - Cloudflare specific property
        cf: {
          cacheTtl: 300,  // Cache for 5 minutes (300 seconds)
          cacheEverything: true,
          minify: { html: true },
          mirage: true
        }
      });
      newResponse.headers.set('X-Middleware-Cache', 'executed-v2');
      newResponse.headers.set('X-Middleware-Time', new Date().toISOString());

      // Only cache successful responses
      if (newResponse.status === 200) {
        // Make sure cache headers are set
        if (!newResponse.headers.has('Cache-Control')) {
          // Standard cache headers
          newResponse.headers.set(
            'Cache-Control',
            'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
          );
          
          // Cloudflare-specific cache headers
          newResponse.headers.set('CDN-Cache-Control', 'public, max-age=300');
          newResponse.headers.set('Surrogate-Control', 'public, max-age=300');
          
          // Force Cloudflare to cache this response
          newResponse.headers.set('CF-Cache-Status', 'DYNAMIC');
          
          // Add Cache-Tag for easier cache management in Cloudflare dashboard
          newResponse.headers.set('Cache-Tag', 'astro-ssr');
        }

        // Store in Cloudflare's cache
        // @ts-expect-error - Cloudflare specific API
        locals.waitUntil?.(cache.put(cacheKey, newResponse.clone()));
        console.log(`Cached ${url.pathname}`);
      }

      return newResponse;
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  // Fallback if cache is not available or there's an error
  const response = await next();
  
  // Create a new response with Cloudflare-specific cache directives
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    // @ts-expect-error - Cloudflare specific property
    cf: {
      cacheTtl: 300,  // Cache for 5 minutes (300 seconds)
      cacheEverything: true,
      minify: { html: true },
      mirage: true
    }
  });
  newResponse.headers.set('X-Middleware-Fallback', 'no-cache-api');
  newResponse.headers.set('X-Middleware-Time', new Date().toISOString());

  // Add cache headers even if we can't use the Cache API
  if (!newResponse.headers.has('Cache-Control') && newResponse.status === 200) {
    // Standard cache headers
    newResponse.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
    );
    
    // Cloudflare-specific cache headers
    newResponse.headers.set('CDN-Cache-Control', 'public, max-age=300');
    newResponse.headers.set('Surrogate-Control', 'public, max-age=300');
    
    // Force Cloudflare to cache this response
    newResponse.headers.set('CF-Cache-Status', 'DYNAMIC');
    
    // Add Cache-Tag for easier cache management in Cloudflare dashboard
    newResponse.headers.set('Cache-Tag', 'astro-ssr');
  }

  return newResponse;
};
