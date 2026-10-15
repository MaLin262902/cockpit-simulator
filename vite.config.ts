import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' : relative Pfade, damit die Seite unter jedem GitHub-Pages-Repo-Namen läuft.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
