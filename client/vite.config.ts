import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  // Use VITE_BACKEND_PORT from loaded env or default to 5003
  const backendPort = env.VITE_BACKEND_PORT || '5003';
  const backendTarget = `http://localhost:${backendPort}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // Proxy API requests to the Node backend
        '/api': {
          target: backendTarget, // Use the dynamically determined target
          changeOrigin: true,             // Needed for virtual hosted sites
          secure: false,                  // Set to true if your backend uses HTTPS
          // You might not need rewrite, as the routes already expect /api
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      port: 3000, // Keep the frontend running on port 3000
    },
  }
}) 