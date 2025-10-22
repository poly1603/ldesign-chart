/**
 * 工具函数测试
 */

import { describe, it, expect, vi } from 'vitest';
import {
  deepMerge,
  memoize,
  batch,
  isObject,
  isArray,
  debounce,
  throttle,
  generateId,
  unique,
  groupBy,
  range,
  shallowEqual,
} from '../utils/helpers';

describe('deepMerge', () => {
  it('应该深度合并对象', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4,
    });
  });

  it('应该处理空source', () => {
    const target = { a: 1 };
    const result = deepMerge(target, {});

    expect(result).toEqual(target);
  });

  it('应该覆盖基本类型值', () => {
    const target = { a: 1 };
    const source = { a: 2 };

    const result = deepMerge(target, source);

    expect(result.a).toBe(2);
  });
});

describe('memoize', () => {
  it('应该缓存函数结果', () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);

    // 函数只应该被调用一次
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该支持自定义键生成器', () => {
    const fn = vi.fn((obj: any) => obj.value * 2);
    const memoized = memoize(fn, {
      keyGenerator: (obj) => obj.id,
    });

    memoized({ id: '1', value: 5 });
    memoized({ id: '1', value: 10 }); // 相同id，应该使用缓存

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该在TTL过期后重新计算', async () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = memoize(fn, { ttl: 100 });

    memoized(5);

    await new Promise(resolve => setTimeout(resolve, 150));

    memoized(5); // TTL过期，应该重新计算

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该限制缓存大小', () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = memoize(fn, { maxSize: 2 });

    memoized(1);
    memoized(2);
    memoized(3); // 超出maxSize，应该删除第一个

    memoized(1); // 应该重新计算

    expect(fn).toHaveBeenCalledTimes(4); // 1, 2, 3, 1
  });
});

describe('batch', () => {
  it('应该批量处理项目', async () => {
    const fn = vi.fn((items: number[]) => items.reduce((a, b) => a + b, 0));
    const batched = batch(fn, { delay: 10, maxSize: 3 });

    const promises = [
      batched(1),
      batched(2),
      batched(3),
    ];

    await Promise.all(promises);

    // 应该只调用一次，处理所有3个项目
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith([1, 2, 3]);
  });
});

describe('类型判断', () => {
  it('isObject 应该正确判断对象', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('string')).toBe(false);
  });

  it('isArray 应该正确判断数组', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isArray('string')).toBe(false);
  });
});

describe('debounce', () => {
  it('应该防抖函数调用', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    // 立即检查，不应该被调用
    expect(fn).not.toHaveBeenCalled();

    // 等待防抖时间
    await new Promise(resolve => setTimeout(resolve, 150));

    // 应该只调用一次
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  it('应该节流函数调用', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    // 第一次调用应该立即执行
    expect(fn).toHaveBeenCalledTimes(1);

    // 等待节流时间
    await new Promise(resolve => setTimeout(resolve, 150));

    throttled();

    // 应该被调用第二次
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('generateId', () => {
  it('应该生成唯一ID', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });

  it('应该支持自定义前缀', () => {
    const id = generateId('test');

    expect(id).toContain('test-');
  });
});

describe('unique', () => {
  it('应该去重基本类型数组', () => {
    const arr = [1, 2, 2, 3, 3, 3];
    const result = unique(arr);

    expect(result).toEqual([1, 2, 3]);
  });

  it('应该支持自定义键函数', () => {
    const arr = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 1, name: 'C' },
    ];

    const result = unique(arr, (item) => item.id);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});

describe('groupBy', () => {
  it('应该按键分组', () => {
    const arr = [
      { type: 'A', value: 1 },
      { type: 'B', value: 2 },
      { type: 'A', value: 3 },
    ];

    const result = groupBy(arr, (item) => item.type);

    expect(result.A).toHaveLength(2);
    expect(result.B).toHaveLength(1);
  });
});

describe('range', () => {
  it('应该生成数字范围', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(2, 5)).toEqual([2, 3, 4]);
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
  });
});

describe('shallowEqual', () => {
  it('应该浅比较对象', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('应该比较基本类型', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('a', 'a')).toBe(true);
    expect(shallowEqual(null, null)).toBe(true);
  });
});

