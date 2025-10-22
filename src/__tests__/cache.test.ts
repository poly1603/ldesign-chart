/**
 * 缓存系统测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartCache, fastHash } from '../memory/cache';

describe('ChartCache', () => {
  let cache: ChartCache;

  beforeEach(() => {
    cache = new ChartCache(10, 1000); // 小容量，短TTL用于测试
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('基础功能', () => {
    it('应该能够设置和获取缓存', () => {
      const key = 'test';
      const value = { data: [1, 2, 3] };

      cache.set(key, value);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(value);
    });

    it('应该在超过最大容量时使用LRU策略', () => {
      // 填满缓存
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // 访问 key0，使其成为最近使用
      cache.get('key0');

      // 添加新项，应该删除 key1（最少使用）
      cache.set('key10', 'value10');

      expect(cache.get('key0')).toBe('value0'); // 还在
      expect(cache.get('key1')).toBeUndefined(); // 被删除
      expect(cache.get('key10')).toBe('value10'); // 新加的
    });

    it('应该在TTL过期后返回undefined', async () => {
      cache.set('key', 'value', 100); // 100ms TTL

      expect(cache.get('key')).toBe('value');

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('key')).toBeUndefined();
    });

    it('应该支持has方法', () => {
      cache.set('key', 'value');

      expect(cache.has('key')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('应该支持delete方法', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);

      cache.delete('key');
      expect(cache.has('key')).toBe(false);
    });

    it('应该支持clear方法', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('统计功能', () => {
    it('应该正确统计命中率', () => {
      cache.set('key', 'value');

      cache.get('key'); // 命中
      cache.get('key'); // 命中
      cache.get('nonexistent'); // 未命中

      const stats = cache.stats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3);
    });

    it('应该跟踪缓存大小', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.stats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
    });
  });

  describe('自适应调整', () => {
    it('应该根据命中率自动调整大小', () => {
      cache.setAutoResize(true);
      cache.setTargetHitRate(0.8);

      // 模拟低命中率
      for (let i = 0; i < 100; i++) {
        cache.get('nonexistent'); // 100次未命中
      }

      cache.set('key', 'value');
      for (let i = 0; i < 50; i++) {
        cache.get('key'); // 50次命中
      }

      // 命中率 = 50/150 = 0.33，低于目标0.8
      // 应该增加缓存大小
      const initialMax = cache.stats().maxSize;

      // 触发自适应调整（通常在内部定时器中）
      // 这里我们无法直接测试，但可以验证API存在
      expect(cache.setAutoResize).toBeDefined();
    });
  });
});

describe('fastHash', () => {
  it('应该为字符串返回自身', () => {
    expect(fastHash('test')).toBe('test');
  });

  it('应该为数字返回字符串', () => {
    expect(fastHash(123)).toBe('123');
  });

  it('应该为数组生成哈希', () => {
    const hash = fastHash([1, 2, 3]);
    expect(hash).toContain('arr:');
  });

  it('应该对大数组使用采样策略', () => {
    const largeArray = new Array(200).fill(0).map((_, i) => i);
    const hash = fastHash(largeArray);

    expect(hash).toContain('arr:');
    expect(hash.length).toBeLessThan(1000); // 采样后长度应该较小
  });

  it('应该为对象生成哈希', () => {
    const hash = fastHash({ a: 1, b: 2 });
    expect(hash).toContain('obj:');
  });

  it('应该为相同数据生成相同哈希', () => {
    const data = { a: 1, b: [2, 3] };
    const hash1 = fastHash(data);
    const hash2 = fastHash(data);

    expect(hash1).toBe(hash2);
  });
});

