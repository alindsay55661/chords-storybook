import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  test: {
    reporters: ['verbose', 'html'],
    outputFile: resolve(outDir, 'vitest/index.html'),
    coverage: {
      enabled: false,
      exclude: [
        ...configDefaults.coverage.exclude,
        '**/*.stories.{ts,tsx,js,jsx}',
      ],
      reportsDirectory: resolve(outDir, 'coverage/'),
      reporter: 'html',
    },
  },
  build: {
    outDir,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        app: resolve(root, 'app/index.html'),
      },
    },
  },
})
