/**
 * @ldesign/builder 构建配置
 * @ldesign/chart v2.0.0 双引擎架构
 */

export default {
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    // ESM 输出到 es/
    esm: {
      dir: 'es',
      format: 'esm',
    },
    // CJS 输出到 lib/
    cjs: {
      dir: 'lib',
      format: 'cjs',
    },
    // UMD 输出到 dist/（可选）
    umd: {
      enabled: false, // 暂时禁用，使用 rollup 处理
    },
  },

  // 外部依赖
  external: [
    'vue',
    'react',
    'react-dom',
    'lit',
    'echarts',
    'echarts/core',
    'echarts/charts',
    'echarts/components',
    'echarts/renderers',
    '@visactor/vchart',
    /^@visactor\//,
  ],

  // TypeScript 配置
  dts: {
    enabled: true,
    // 类型定义输出到 es/
    outputDir: 'es',
  },

  // 排除测试文件
  exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],

  // 构建选项
  clean: true,

  // 生成构建报告
  report: true,
};
