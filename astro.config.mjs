import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';


import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  // Enable server-side rendering
  output: 'server',
  adapter: netlify({}),
  integrations: [
    tailwind({
      // Use a custom config file
      configFile: './tailwind.config.cjs',
    })
  ],
  image: {
    // Enable image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    // Configure image formats
    formats: ['avif', 'webp', 'jpeg'],
    // Authorize remote image domains
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'cloudfront-us-east-1.images.arcpublishing.com'
    ],
    // Allow HTTPS images from any domain as fallback
    remotePatterns: [{ protocol: 'https' }]
  }
});
