import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',

  output: {
    formats: ['esm', 'cjs', 'umd', 'dts'],
    esm: {
      dir: 'es',
      minify: false,
    },
    cjs: {
      dir: 'lib',
      minify: false,
    },
    umd: {
      dir: 'dist',
      name: 'LChart',
      minify: true,
    },
    dts: {
      dir: 'es',
      only: false,
    },
  },

  bundler: 'rollup',

  sourcemap: true,
})
