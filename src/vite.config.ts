import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'motion/react', 
      'lucide-react',
      'sonner',
      'react-hook-form',
      'recharts',
      'react-slick',
      'react-responsive-masonry',
      'react-dnd',
      'react-dnd-html5-backend',
      're-resizable',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ]
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['motion/react'],
          'ui-vendor': ['lucide-react', 'sonner'],
          'form-vendor': ['react-hook-form'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
})