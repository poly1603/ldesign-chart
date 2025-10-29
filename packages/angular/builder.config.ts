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
  external: ['@angular/core', '@angular/common', 'echarts', 'rxjs'],
  dts: {
    enabled: true,
  },
})
