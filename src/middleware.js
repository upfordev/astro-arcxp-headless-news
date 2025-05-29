// Middleware for Astro on Vercel
export const onRequest = async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // Skip middleware for static assets
  if (url.pathname.startsWith('/_astro/') || 
      url.pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg|css|js|woff|woff2)$/)) {
    return next();
  }
  
  // Add security headers
  const response = await next();
  
  // Add security headers
  const headers = new Headers(response.headers);
  
  // Add security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add caching for homepage
  if (url.pathname === '/') {
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
  }
  
  // Return the response with added headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
