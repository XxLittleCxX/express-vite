import {build} from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

build({
  bundle: true,
  entryPoints: ['./server/main.ts'],
  outfile: 'dist/main.js',
  sourcemap: 'inline',
  platform: 'node',
  target: 'node14.4.0',
  plugins: [nodeExternalsPlugin()]
})