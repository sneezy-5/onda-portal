import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

try {
  const src = 'C:/Users/HP/.gemini/antigravity-ide/brain/49fff78e-4fe9-4a6e-b7a8-9cd70be68e5c/onda_mobile_app_mockup_1782233035594.png';
  const dest = path.resolve(__dirname, 'public/mockup.png');
  fs.copyFileSync(src, dest);
  console.log('--- Mockup copied successfully via vite.config.js ---');
} catch (err) {
  console.error('--- Failed to copy mockup in vite.config.js:', err.message);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
})
