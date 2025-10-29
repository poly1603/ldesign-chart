import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    formats: ['es', 'cjs'],
    dir: {
      es: 'es',
      cjs: 'lib',
    },
  },
  external: ['svelte', 'svelte/internal', 'echarts'],
  dts: {
    enabled: true,
  },
})
