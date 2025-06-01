import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import cloudflare from '@astrojs/cloudflare';

// Using root-level middleware.ts file instead of manual registration

// https://astro.build/config
export default defineConfig({

  // Enable server-side rendering
  output: 'server',

  integrations: [
    tailwind({
      // Use a custom config file
      configFile: './tailwind.config.cjs',
    })
  ],

  adapter: cloudflare({
    imageService: 'cloudflare' // Use Cloudflare Image Resizing service
  }),

  // Middleware is now automatically detected from src/middleware.ts
});