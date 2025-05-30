// src/middleware/bypass-cdn-cgi.ts
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // Let Cloudflare handle image optimization requests
  if (url.pathname.startsWith('/cdn-cgi/image/')) {
    return fetch(context.request);
  }

  // Continue with Astro handling
  return next();
};
