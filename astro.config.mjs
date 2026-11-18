import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// ページはすべて静的に書き出し、/api/contact だけを Vercel のサーバー関数として動かす
export default defineConfig({
  site: 'https://kitakyu-reha-hub.vercel.app',
  output: 'static',
  adapter: vercel(),
  security: { checkOrigin: true },
});
