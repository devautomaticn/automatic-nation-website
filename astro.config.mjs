// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://devautomaticn.github.io',
  base: '/automatic-nation-website',
  vite: {
    plugins: [tailwindcss()],
  },
});
