// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// .env の GITHUB_USERNAME を優先し、未設定時はフォールバック値を使用
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'yu0416ryfu-sys';
const REPO_NAME = 'contact-lens-guide';

export default defineConfig({
  site: `https://${GITHUB_USERNAME}.github.io`,
  base: `/${REPO_NAME}`,
  integrations: [
    tailwind(),
  ],
  output: 'static',
});
