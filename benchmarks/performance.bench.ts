/**
 * 性能基准测试
 * 用于跟踪各版本的性能变化
 */

import { describe, bench } from 'vitest';
import { ChartCache, fastHash } from '../src/memory/cache';
import { DataParser } from '../src/utils/data-parser';
import { SmartConfigGenerator } from '../src/config/smart-config';
import { deepMerge, memoize } from '../src/utils/helpers';

describe('缓存性能', () => {
  const cache = new ChartCache(1000);

  bench('设置缓存', () => {
    cache.set('key', { data: [1, 2, 3, 4, 5] });
  });

  bench('获取缓存', () => {
    cache.get('key');
  });

  bench('fastHash - 小数组', () => {
    fastHash([1, 2, 3, 4, 5]);
  });

  bench('fastHash - 大数组（10k）', () => {
    const largeArray = new Array(10000).fill(0).map((_, i) => i);
    fastHash(largeArray);
  });

  bench('fastHash - 对象', () => {
    fastHash({ a: 1, b: 2, c: 3, d: 4, e: 5 });
  });
});

describe('数据解析性能', () => {
  const parser = new DataParser();

  bench('解析简单数组（100点）', () => {
    const data = new Array(100).fill(0).map((_, i) => i);
    parser.parse(data);
  });

  bench('解析简单数组（1k点）', () => {
    const data = new Array(1000).fill(0).map((_, i) => i);
    parser.parse(data);
  });

  bench('解析简单数组（10k点）', () => {
    const data = new Array(10000).fill(0).map((_, i) => i);
    parser.parse(data);
  });

  bench('解析对象数组（100项）', () => {
    const data = new Array(100).fill(0).map((_, i) => ({
      date: `2024-01-${i}`,
      value1: i * 10,
      value2: i * 20,
    }));
    parser.parse(data);
  });

  bench('解析标准格式', () => {
    const data = {
      labels: new Array(100).fill(0).map((_, i) => `Label ${i}`),
      datasets: [
        { name: 'Series 1', data: new Array(100).fill(0).map((_, i) => i * 10) },
        { name: 'Series 2', data: new Array(100).fill(0).map((_, i) => i * 20) },
      ],
    };
    parser.parse(data);
  });
});

describe('配置生成性能', () => {
  const generator = new SmartConfigGenerator();

  const simpleConfig = {
    type: 'line' as const,
    data: [1, 2, 3, 4, 5],
  };

  const complexConfig = {
    type: 'line' as const,
    data: {
      labels: new Array(1000).fill(0).map((_, i) => `Label ${i}`),
      datasets: [
        { name: 'Series 1', data: new Array(1000).fill(0).map((_, i) => i) },
        { name: 'Series 2', data: new Array(1000).fill(0).map((_, i) => i * 2) },
      ],
    },
    title: 'Test Chart',
    legend: true,
    tooltip: true,
    dataZoom: true,
  };

  bench('生成简单配置', async () => {
    await generator.generate(simpleConfig);
  });

  bench('生成复杂配置', async () => {
    await generator.generate(complexConfig);
  });

  bench('生成配置（带缓存）', async () => {
    await generator.generate({ ...simpleConfig, cache: true });
  });
});

describe('工具函数性能', () => {
  bench('deepMerge - 小对象', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    deepMerge(target, source);
  });

  bench('deepMerge - 大对象', () => {
    const target = Object.fromEntries(
      new Array(100).fill(0).map((_, i) => [`key${i}`, i])
    );
    const source = Object.fromEntries(
      new Array(50).fill(0).map((_, i) => [`key${i}`, i * 2])
    );
    deepMerge(target, source);
  });

  const expensiveFn = (n: number) => {
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += i * n;
    }
    return result;
  };

  const memoized = memoize(expensiveFn);

  bench('函数调用（无记忆化）', () => {
    expensiveFn(10);
  });

  bench('函数调用（记忆化 - 命中）', () => {
    memoized(10);
  });
});

describe('数据操作性能', () => {
  bench('数组去重（1k项）', () => {
    const arr = new Array(1000).fill(0).map((_, i) => i % 100);
    Array.from(new Set(arr));
  });

  bench('数组分组（1k项）', () => {
    const arr = new Array(1000).fill(0).map((_, i) => ({
      category: i % 10,
      value: i,
    }));

    const grouped: Record<number, any[]> = {};
    for (const item of arr) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }
  });
});

