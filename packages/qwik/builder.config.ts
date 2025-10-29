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
  external: ['@builder.io/qwik', 'echarts'],
  dts: {
    enabled: true,
  },
})
