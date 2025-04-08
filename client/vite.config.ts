import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the Go backend running on port 8000
      '/api': {
        target: 'http://localhost:8000', // Your Go backend address
        changeOrigin: true,             // Needed for virtual hosted sites
        secure: false,                  // Set to true if your backend uses HTTPS
        // You might not need rewrite, as Go routes already expect /api
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
    port: 3000, // Keep the frontend running on port 3000
  },
}) 