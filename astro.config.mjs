// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://emsplc.mrswebber.com',

  // Static output → plain HTML/CSS/JS, perfect for S3 + CloudFront.
  output: 'static',

  // Each page builds to /path/index.html (works with S3 website hosting and
  // the CloudFront function documented in DEPLOYMENT.md).
  build: {
    format: 'directory',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
