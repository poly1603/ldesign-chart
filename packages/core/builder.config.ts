/**
 * @ldesign/chart-core 构建配置
 * 
 * 此配置文件用于 @ldesign/builder 打包工具。
 * 目前使用 vite 进行构建（见 vite.config.ts）。
 * 
 * 使用 @ldesign/builder 构建时，请先安装：
 * pnpm add -D @ldesign/builder
 * 
 * 然后运行：
 * npx ldesign-builder build
 */

// 当使用 @ldesign/builder 时启用以下配置：
// import { defineConfig, webLibrary } from '@ldesign/builder'
// 
// export default defineConfig(webLibrary({
//   name: 'LDesignChart',
//   input: 'src/index.ts',
//   output: {
//     format: ['esm', 'cjs', 'umd'],
//     esm: { dir: 'es' },
//     cjs: { dir: 'lib' },
//     umd: { dir: 'dist', name: 'LDesignChart', minify: true },
//   },
//   dts: true,
//   sourcemap: true,
//   clean: true,
// }))

export default {
  name: 'LDesignChart',
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
  },
}
