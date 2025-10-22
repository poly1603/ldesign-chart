/**
 * 实例管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartInstanceManager } from '../core/instance-manager';
import type { ChartInstance } from '../types';

// Mock Chart Instance
const createMockInstance = (id: string): ChartInstance => ({
  getId: () => id,
  updateData: vi.fn(),
  setTheme: vi.fn(),
  setDarkMode: vi.fn(),
  setFontSize: vi.fn(),
  refresh: vi.fn(),
  resize: vi.fn(),
  getDataURL: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  dispose: vi.fn(),
  getInstance: vi.fn(),
  getConfig: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false),
});

describe('ChartInstanceManager', () => {
  let manager: ChartInstanceManager;

  beforeEach(() => {
    manager = new ChartInstanceManager(5, 100); // 小容量用于测试
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('基础功能', () => {
    it('应该能够注册实例', () => {
      const instance = createMockInstance('test-1');
      manager.register('test-1', instance);

      expect(manager.has('test-1')).toBe(true);
      expect(manager.size()).toBe(1);
    });

    it('应该能够获取实例', () => {
      const instance = createMockInstance('test-1');
      manager.register('test-1', instance);

      const retrieved = manager.get('test-1');

      expect(retrieved).toBe(instance);
    });

    it('应该能够销毁实例', () => {
      const instance = createMockInstance('test-1');
      manager.register('test-1', instance);

      manager.dispose('test-1');

      expect(manager.has('test-1')).toBe(false);
      expect(instance.dispose).toHaveBeenCalled();
    });

    it('应该能够销毁所有实例', () => {
      const instance1 = createMockInstance('test-1');
      const instance2 = createMockInstance('test-2');

      manager.register('test-1', instance1);
      manager.register('test-2', instance2);

      manager.disposeAll();

      expect(manager.size()).toBe(0);
      expect(instance1.dispose).toHaveBeenCalled();
      expect(instance2.dispose).toHaveBeenCalled();
    });
  });

  describe('LRU 策略', () => {
    it('应该在超过最大容量时使用LRU策略', () => {
      // 注册5个实例（达到上限）
      for (let i = 0; i < 5; i++) {
        manager.register(`test-${i}`, createMockInstance(`test-${i}`));
      }

      expect(manager.size()).toBe(5);

      // 访问 test-0，使其成为最近使用
      manager.get('test-0');

      // 注册新实例，应该删除最少使用的
      manager.register('test-5', createMockInstance('test-5'));

      expect(manager.size()).toBe(5);
      expect(manager.has('test-0')).toBe(true); // 最近访问，应该保留
      expect(manager.has('test-5')).toBe(true); // 新加的
    });

    it('应该跟踪访问次数', () => {
      const instance = createMockInstance('test-1');
      manager.register('test-1', instance);

      // 多次访问
      manager.get('test-1');
      manager.get('test-1');
      manager.get('test-1');

      // 访问次数应该影响LRU评分
      const stats = manager.stats();
      expect(stats.avgAccessCount).toBeGreaterThan(0);
    });
  });

  describe('优先级管理', () => {
    it('应该支持设置优先级', () => {
      const instance = createMockInstance('test-1');
      manager.register('test-1', instance, 8);

      const priority = manager.getPriority('test-1');

      expect(priority).toBe(8);
    });

    it('应该保护高优先级实例不被LRU淘汰', () => {
      // 注册高优先级实例
      manager.register('high', createMockInstance('high'), 9);

      // 注册其他实例填满容量
      for (let i = 0; i < 4; i++) {
        manager.register(`test-${i}`, createMockInstance(`test-${i}`), 5);
      }

      // 再注册一个，应该删除低优先级的
      manager.register('new', createMockInstance('new'), 5);

      // 高优先级实例应该保留
      expect(manager.has('high')).toBe(true);
    });

    it('应该支持动态修改优先级', () => {
      manager.register('test-1', createMockInstance('test-1'), 5);

      manager.setPriority('test-1', 8);

      expect(manager.getPriority('test-1')).toBe(8);
    });
  });

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      manager.register('test-1', createMockInstance('test-1'));
      manager.register('test-2', createMockInstance('test-2'));

      const stats = manager.stats();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.ids).toEqual(expect.arrayContaining(['test-1', 'test-2']));
      expect(stats.maxInstances).toBe(5);
    });

    it('应该跟踪内存使用', () => {
      manager.register('test-1', createMockInstance('test-1'));
      manager.updateMemoryUsage('test-1', 1024 * 1024); // 1MB

      const stats = manager.stats();

      expect(stats.memoryUsage).toBe(1024 * 1024);
    });
  });

  describe('容量管理', () => {
    it('应该支持动态调整最大实例数', () => {
      // 注册5个实例
      for (let i = 0; i < 5; i++) {
        manager.register(`test-${i}`, createMockInstance(`test-${i}`));
      }

      // 减小到3个
      manager.setMaxInstances(3);

      expect(manager.size()).toBe(3);
    });
  });

  describe('辅助方法', () => {
    it('应该返回所有实例ID', () => {
      manager.register('test-1', createMockInstance('test-1'));
      manager.register('test-2', createMockInstance('test-2'));

      const ids = manager.getAllIds();

      expect(ids).toHaveLength(2);
      expect(ids).toEqual(expect.arrayContaining(['test-1', 'test-2']));
    });

    it('应该检查实例是否存在', () => {
      manager.register('test-1', createMockInstance('test-1'));

      expect(manager.has('test-1')).toBe(true);
      expect(manager.has('nonexistent')).toBe(false);
    });
  });
});

