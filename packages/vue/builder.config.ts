import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',

  libraryType: 'vue3',

  output: {
    formats: ['esm', 'cjs', 'dts'],
    esm: {
      dir: 'es',
    },
    cjs: {
      dir: 'lib',
    },
    dts: {
      dir: 'es',
    },
    umd: false,
    name: 'LChartVue',
  },

  external: ['vue', '@ldesign/chart-core'],

  vue: {
    version: 3,
  },

  bundler: 'rollup',

  minify: false,
  sourcemap: true,
  dts: true,
})
