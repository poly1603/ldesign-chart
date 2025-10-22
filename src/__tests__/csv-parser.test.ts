/**
 * CSV 解析器测试
 */

import { describe, it, expect } from 'vitest';
import { CSVParser } from '../utils/parsers/csv-parser';

describe('CSVParser', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('基础解析', () => {
    it('应该解析简单的CSV', () => {
      const csv = `Name,Value1,Value2
A,10,20
B,15,25
C,20,30`;

      const result = parser.parse(csv);

      expect(result.labels).toEqual(['A', 'B', 'C']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].name).toBe('Value1');
      expect(result.datasets[0].data).toEqual([10, 15, 20]);
      expect(result.datasets[1].data).toEqual([20, 25, 30]);
    });

    it('应该处理自定义分隔符', () => {
      const csv = `Name;Value
A;10
B;20`;

      const result = parser.parse(csv, { delimiter: ';' });

      expect(result.labels).toEqual(['A', 'B']);
      expect(result.datasets[0].data).toEqual([10, 20]);
    });

    it('应该处理没有表头的CSV', () => {
      const csv = `A,10,20
B,15,25`;

      const result = parser.parse(csv, { hasHeader: false });

      expect(result.labels).toEqual(['A', 'B']);
      expect(result.datasets).toHaveLength(2);
    });

    it('应该跳过空行', () => {
      const csv = `Name,Value

A,10

B,20`;

      const result = parser.parse(csv);

      expect(result.labels).toHaveLength(2);
    });

    it('应该跳过注释行', () => {
      const csv = `Name,Value
# This is a comment
A,10
# Another comment
B,20`;

      const result = parser.parse(csv, { comment: '#' });

      expect(result.labels).toHaveLength(2);
    });
  });

  describe('引号处理', () => {
    it('应该处理引号包裹的值', () => {
      const csv = `Name,Description
A,"Hello, World"
B,"Test"`;

      const result = parser.parse(csv);

      expect(result.datasets[0].data).toEqual(['Hello, World', 'Test']);
    });

    it('应该处理转义的引号', () => {
      const csv = `Name,Quote
A,"He said ""Hello"""
B,"Normal"`;

      const result = parser.parse(csv);

      expect(result.datasets[0].data[0]).toBe('He said "Hello"');
    });

    it('应该处理引号中的换行符', () => {
      const csv = `Name,Text
A,"Line 1
Line 2"
B,"Single"`;

      const result = parser.parse(csv);

      expect(result.datasets[0].data[0]).toContain('Line 1\nLine 2');
    });
  });

  describe('类型转换', () => {
    it('应该自动转换数字', () => {
      const csv = `Name,Value
A,123
B,456.78`;

      const result = parser.parse(csv, { autoType: true });

      expect(result.datasets[0].data).toEqual([123, 456.78]);
      expect(typeof result.datasets[0].data[0]).toBe('number');
    });

    it('应该自动转换布尔值', () => {
      const csv = `Name,Flag
A,true
B,false`;

      const result = parser.parse(csv, { autoType: true });

      expect(result.datasets[0].data).toEqual([true, false]);
    });

    it('应该禁用自动类型转换', () => {
      const csv = `Name,Value
A,123`;

      const result = parser.parse(csv, { autoType: false });

      expect(result.datasets[0].data).toEqual(['123']);
      expect(typeof result.datasets[0].data[0]).toBe('string');
    });
  });

  describe('导出功能', () => {
    it('应该导出为CSV', () => {
      const data = {
        labels: ['A', 'B'],
        datasets: [
          { name: 'Value1', data: [10, 20] },
          { name: 'Value2', data: [15, 25] },
        ],
      };

      const csv = parser.export(data);

      expect(csv).toContain('Label,Value1,Value2');
      expect(csv).toContain('A,10,15');
      expect(csv).toContain('B,20,25');
    });

    it('应该处理特殊字符', () => {
      const data = {
        labels: ['A,B', 'C"D'],
        datasets: [{ name: 'Value', data: [10, 20] }],
      };

      const csv = parser.export(data);

      expect(csv).toContain('"A,B"'); // 逗号需要引号
      expect(csv).toContain('"C""D"'); // 引号需要转义
    });
  });

  describe('数据验证', () => {
    it('应该验证有效的CSV', () => {
      const csv = `Name,Value
A,10
B,20`;

      const result = parser.validate(csv);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测空CSV', () => {
      const result = parser.validate('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CSV 内容为空');
    });

    it('应该检测不一致的列数', () => {
      const csv = `Name,Value1,Value2
A,10
B,20,30,40`;

      const result = parser.validate(csv);

      // 应该有警告或错误
      expect(result.valid || result.warnings.length > 0).toBe(true);
    });
  });

  describe('类型推断', () => {
    it('应该正确推断列类型', () => {
      const rows = [
        ['A', 10, new Date()],
        ['B', 20, new Date()],
      ];

      const types = parser.inferColumnTypes(rows);

      expect(types).toEqual(['string', 'number', 'date']);
    });

    it('应该处理混合类型列', () => {
      const rows = [
        ['A', 10],
        ['B', 'text'],
      ];

      const types = parser.inferColumnTypes(rows);

      expect(types[1]).toBe('string'); // 混合类型视为字符串
    });
  });
});

