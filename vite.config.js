import { defineConfig } from 'vite'

// Note: @vitejs/plugin-legacy does not support library mode (Vite restriction).
// Broad browser compatibility is achieved via the UMD format (which includes
// its own factory wrapper) and Terser minification targeting ES5 output.
// Consumers can apply their own transpilation pipeline if needed.

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    lib: {
      entry: 'src/index.js',
      name: 'tableSortable',
      fileName: () => 'table-sortable.js',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: '$',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) {
            return 'table-sortable.css'
          }
          return name || '[name][extname]'
        },
      },
    },
  },
})
