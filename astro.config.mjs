// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.superthermcorporations.com',
  integrations: [
    tailwind({
      // We manage base styles ourselves in src/styles/global.css
      applyBaseStyles: false,
    }),
  ],
});
