import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '../..');

// Test-only entry point and aliases: never loaded by the production Vite config.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  css: { postcss: repo },
  resolve: {
    alias: [
      { find: '@/contexts/AuthContext', replacement: path.resolve(import.meta.dirname, 'mocks.ts') },
      { find: '@/integrations/external-supabase/client', replacement: path.resolve(import.meta.dirname, 'mocks.ts') },
      { find: '@', replacement: path.resolve(repo, 'src') },
    ],
  },
  server: { host: '127.0.0.1', port: 8796, strictPort: true, fs: { allow: [repo] } },
});
