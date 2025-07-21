import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load environment variables for the current mode.
  const env = loadEnv(mode, __dirname)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false, // Set to true if using HTTPS and certs are valid
        },
      },
    },
    define: {
      // Vite replaces process.env with actual env values during build
      'process.env': {
        ...env,
      },
    },
  }
})
