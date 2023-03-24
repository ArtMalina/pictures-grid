import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
    target: 'es2015',
  },
  resolve: {
    alias: {
      '@components': path.resolve('./src/components'),
    }
  }
})
