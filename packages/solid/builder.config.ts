import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.tsx',
  output: {
    formats: ['es', 'cjs'],
    dir: {
      es: 'es',
      cjs: 'lib',
    },
  },
  external: ['solid-js', 'solid-js/web', 'echarts'],
  dts: {
    enabled: true,
  },
})
