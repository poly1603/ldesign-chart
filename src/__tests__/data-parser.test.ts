/**
 * 数据解析器测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataParser } from '../utils/data-parser';

describe('DataParser', () => {
  let parser: DataParser;

  beforeEach(() => {
    parser = new DataParser();
  });

  describe('简单数组解析', () => {
    it('应该正确解析简单数字数组', () => {
      const data = [1, 2, 3, 4, 5];
      const result = parser.parse(data);

      expect(result.dataType).toBe('simple');
      expect(result.series).toEqual([[1, 2, 3, 4, 5]]);
      expect(result.seriesNames).toEqual(['Series 1']);
      expect(result.totalPoints).toBe(5);
    });

    it('应该为简单数组生成索引作为xData', () => {
      const data = [10, 20, 30];
      const result = parser.parse(data);

      expect(result.xData).toEqual([0, 1, 2]);
    });
  });

  describe('对象数组解析', () => {
    it('应该正确解析对象数组', () => {
      const data = [
        { date: '2024-01', sales: 100, profit: 20 },
        { date: '2024-02', sales: 150, profit: 30 },
        { date: '2024-03', sales: 200, profit: 40 },
      ];

      const result = parser.parse(data);

      expect(result.dataType).toBe('object');
      expect(result.xData).toEqual(['2024-01', '2024-02', '2024-03']);
      expect(result.series).toHaveLength(2);
      expect(result.seriesNames).toEqual(['sales', 'profit']);
    });

    it('应该识别常见的X轴字段', () => {
      const data = [
        { time: '10:00', value: 100 },
        { time: '11:00', value: 150 },
      ];

      const result = parser.parse(data);

      expect(result.xData).toEqual(['10:00', '11:00']);
      expect(result.seriesNames).toEqual(['value']);
    });
  });

  describe('标准格式解析', () => {
    it('应该正确解析标准格式数据', () => {
      const data = {
        labels: ['A', 'B', 'C'],
        datasets: [
          { name: 'Series 1', data: [10, 20, 30] },
          { name: 'Series 2', data: [15, 25, 35] },
        ],
      };

      const result = parser.parse(data);

      expect(result.dataType).toBe('standard');
      expect(result.xData).toEqual(['A', 'B', 'C']);
      expect(result.series).toEqual([[10, 20, 30], [15, 25, 35]]);
      expect(result.seriesNames).toEqual(['Series 1', 'Series 2']);
      expect(result.totalPoints).toBe(6);
    });

    it('应该在没有标签时生成索引', () => {
      const data = {
        datasets: [{ data: [10, 20, 30] }],
      };

      const result = parser.parse(data);

      expect(result.xData).toEqual([0, 1, 2]);
    });
  });

  describe('时间序列检测', () => {
    it('应该识别Date对象', () => {
      const data = {
        labels: [new Date('2024-01-01'), new Date('2024-01-02')],
        datasets: [{ data: [10, 20] }],
      };

      const result = parser.parse(data);

      expect(result.isTimeSeries).toBe(true);
    });

    it('应该识别时间戳', () => {
      const data = {
        labels: [1704067200000, 1704153600000], // 2024-01-01, 2024-01-02
        datasets: [{ data: [10, 20] }],
      };

      const result = parser.parse(data);

      expect(result.isTimeSeries).toBe(true);
    });

    it('应该识别时间字符串', () => {
      const data = {
        labels: ['2024-01-01', '2024-01-02'],
        datasets: [{ data: [10, 20] }],
      };

      const result = parser.parse(data);

      expect(result.isTimeSeries).toBe(true);
    });
  });

  describe('数据统计', () => {
    it('应该正确计算数据统计', () => {
      const data = [10, 20, 30, 40, 50];
      const stats = parser.getDataStats(data);

      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.avg).toBe(30);
      expect(stats.total).toBe(150);
      expect(stats.count).toBe(5);
    });

    it('应该处理空数据', () => {
      const data: number[] = [];
      const stats = parser.getDataStats(data);

      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.count).toBe(0);
    });
  });

  describe('数据验证', () => {
    it('应该验证有效数据', () => {
      const data = {
        labels: ['A', 'B'],
        datasets: [{ data: [1, 2] }],
      };

      const result = parser.validate(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测空数据', () => {
      const result = parser.validate(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('数据不能为空');
    });

    it('应该检测空数组', () => {
      const result = parser.validate([]);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该检测缺少datasets字段', () => {
      const data = { labels: ['A', 'B'] };

      const result = parser.validate(data as any);

      expect(result.valid).toBe(false);
    });
  });

  describe('缓存功能', () => {
    it('应该缓存解析结果', () => {
      const data = [1, 2, 3];

      const result1 = parser.parse(data);
      const result2 = parser.parse(data);

      // 第二次应该从缓存获取（相同引用）
      expect(result2).toBe(result1);
    });

    it('应该支持清除缓存', () => {
      const data = [1, 2, 3];

      parser.parse(data);
      parser.clearCache();

      // 清除后应该重新解析
      const result = parser.parse(data);
      expect(result).toBeDefined();
    });
  });

  describe('流式解析', () => {
    it('应该支持流式解析大数据', async () => {
      const largeData = new Array(5000).fill(0).map((_, i) => i);
      const chunks: any[] = [];

      await parser.parseStream(
        largeData,
        (chunk, progress) => {
          chunks.push({ chunk, progress });
        },
        1000
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[chunks.length - 1].progress).toBe(1);
    });
  });
});

describe('fastHash', () => {
  it('应该为基本类型生成哈希', () => {
    expect(fastHash('test')).toBe('test');
    expect(fastHash(123)).toBe('123');
    expect(fastHash(true)).toBe('true');
    expect(fastHash(null)).toBe('null');
    expect(fastHash(undefined)).toBe('undefined');
  });

  it('应该为数组生成哈希', () => {
    const hash = fastHash([1, 2, 3]);
    expect(hash).toContain('arr:');
  });

  it('应该为大数组使用采样', () => {
    const largeArray = new Array(200).fill(0).map((_, i) => i);
    const hash1 = fastHash(largeArray);
    const hash2 = fastHash(largeArray);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeLessThan(200);
  });

  it('应该为对象生成哈希', () => {
    const hash = fastHash({ a: 1, b: 2 });
    expect(hash).toContain('obj:');
  });

  it('应该为相同数据生成相同哈希', () => {
    const data = { a: 1, b: [2, 3] };
    expect(fastHash(data)).toBe(fastHash(data));
  });
});

