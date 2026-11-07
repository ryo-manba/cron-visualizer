import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build' },
  test: { environment: 'jsdom', setupFiles: ['./src/testSetup.ts'], restoreMocks: true, env: { TZ: 'Asia/Tokyo' } },
});
