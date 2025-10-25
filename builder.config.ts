/**
 * @ldesign/builder 极简配置
 * @ldesign/chart - 混合框架图表库
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 仅需指定 UMD 全局名称
  name: 'LDesignChart',
  
  // 可选：自定义输出目录（使用默认值即可）
  // libs: {
  //   esm: { output: 'es' },    // 默认
  //   cjs: { output: 'lib' },   // 默认
  //   umd: { output: 'dist' }   // 默认
  // }
})

// 就这么简单！
// @ldesign/builder 会自动：
// 1. 检测 Vue + React + Lit 混合框架
// 2. 配置正确的 JSX 转换
// 3. 外部化框架依赖
// 4. 生成 ESM + CJS + UMD 格式
// 5. 优化构建性能