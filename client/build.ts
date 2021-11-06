import {resolve} from 'path'
import {build} from "vite";
import vuePlugin from '@vitejs/plugin-vue'

const root = resolve(__dirname, '../client')
build({
  root,
  base: './',
  build: {
    outDir: resolve(__dirname, '../dist/client'),
    minify: 'esbuild',
    emptyOutDir: true,
  },
  plugins: [vuePlugin()],
})