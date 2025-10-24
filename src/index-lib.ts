/**
 * UMD 入口文件
 * 用于浏览器全局变量导出
 */

// 导出所有内容
export * from './index';

// 默认导出（用于 UMD）
import { Chart, createChart, engineManager, chartCache, echartsLoader, chartLoader } from './index';

export default {
  Chart,
  createChart,
  engineManager,
  chartCache,
  echartsLoader,
  chartLoader,
};

