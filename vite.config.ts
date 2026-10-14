import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/japan-2026-plan/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf('node_modules') === -1) return;
          if (id.indexOf('/leaflet/') !== -1 || id.indexOf('/react-leaflet/') !== -1) return 'map-vendor';
          if (id.indexOf('/react-dom/') !== -1) return 'react-vendor';
          if (id.indexOf('/react/') !== -1) return 'react-vendor';
          if (id.indexOf('/lucide-react/') !== -1) return 'icons';
        },
      },
    },
  },
});

