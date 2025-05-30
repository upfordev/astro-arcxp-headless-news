import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import cloudflare from '@astrojs/cloudflare';

import { onRequest } from './src/middleware/bypass-cdn-cgi';

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

  middleware: [onRequest] // 👈 Register the middleware
});