import { defineConfig } from 'vite'
import node_sponsor from "nodespode"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    node_sponsor()
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@components': '/src/components',  // Alias for components
      '@utils': '/src/utils',            // Alias for utility functions
    }
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000'),
  }
})