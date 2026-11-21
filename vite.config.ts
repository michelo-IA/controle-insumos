import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expõe na rede local (ex: 192.168.1.8) para celulares/tablets
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
