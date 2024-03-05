// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'chromospace',
      // the proper extensions will be added
      fileName: 'chromospace',
    },
    target: 'esnext',
    // rollupOptions: {
    //   // make sure to externalize deps that shouldn't be bundled
    //   // into your library
    //   external: ['vue'],
    //   output: {
    //     // Provide global variables to use in the UMD build
    //     // for externalized deps
    //     globals: {
    //       vue: 'Vue',
    //     },
    //   },
    // },
    rollupOptions: {
      output: {
        format: "es",
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Three',
        },
      },
      external: ['three'],
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    }
  },
})
