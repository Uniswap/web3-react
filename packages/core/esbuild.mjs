import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

esbuild
  .build({
    entryPoints: ['src/index.tsx'],
    outdir: 'dist/esm',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: 'esnext',
    plugins: [nodeExternalsPlugin()],
  })
  .catch(console.error)

esbuild
  .build({
    entryPoints: ['src/index.tsx'],
    outdir: 'dist/cjs',
    bundle: true,
    sourcemap: true,
    minify: true,
    format: 'cjs',
    target: 'esnext',
    plugins: [nodeExternalsPlugin()],
  })
  .catch(console.error)
