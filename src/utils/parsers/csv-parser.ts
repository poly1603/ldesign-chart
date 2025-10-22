/**
 * CSV 数据解析器
 * 支持 CSV 字符串解析、文件读取、自动类型推断
 */

import type { ChartData, SimpleChartData } from '../../types';

export interface CSVParseOptions {
  /** 分隔符，默认为逗号 */
  delimiter?: string;
  /** 是否有表头，默认 true */
  hasHeader?: boolean;
  /** 是否自动类型转换，默认 true */
  autoType?: boolean;
  /** 跳过空行，默认 true */
  skipEmptyLines?: boolean;
  /** 注释符号，以此开头的行将被忽略 */
  comment?: string;
  /** 自定义表头（如果 hasHeader 为 false） */
  headers?: string[];
}

export class CSVParser {
  /**
   * 解析 CSV 字符串
   */
  parse(csvString: string, options: CSVParseOptions = {}): ChartData {
    const {
      delimiter = ',',
      hasHeader = true,
      autoType = true,
      skipEmptyLines = true,
      comment,
      headers: customHeaders,
    } = options;

    // 按行分割
    let lines = csvString.split(/\r?\n/);

    // 过滤空行
    if (skipEmptyLines) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    // 过滤注释行
    if (comment) {
      lines = lines.filter(line => !line.trim().startsWith(comment));
    }

    if (lines.length === 0) {
      return { labels: [], datasets: [] };
    }

    // 解析表头
    let headers: string[];
    let dataStartIndex = 0;

    if (hasHeader && !customHeaders) {
      headers = this.parseLine(lines[0], delimiter);
      dataStartIndex = 1;
    } else if (customHeaders) {
      headers = customHeaders;
      dataStartIndex = 0;
    } else {
      // 没有表头，使用列索引
      const firstLine = this.parseLine(lines[0], delimiter);
      headers = firstLine.map((_, i) => `Column ${i + 1}`);
      dataStartIndex = 0;
    }

    // 解析数据行
    const rows: any[][] = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);

      // 类型转换
      if (autoType) {
        rows.push(values.map(v => this.parseValue(v)));
      } else {
        rows.push(values);
      }
    }

    // 转换为 ChartData 格式
    return this.toChartData(headers, rows);
  }

  /**
   * 从文件读取并解析 CSV
   */
  async parseFile(file: File, options: CSVParseOptions = {}): Promise<ChartData> {
    const text = await this.readFileAsText(file);
    return this.parse(text, options);
  }

  /**
   * 从 URL 读取并解析 CSV
   */
  async parseURL(url: string, options: CSVParseOptions = {}): Promise<ChartData> {
    const response = await fetch(url);
    const text = await response.text();
    return this.parse(text, options);
  }

  /**
   * 解析单行 CSV（处理引号包裹的值）
   */
  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // 分隔符（不在引号内）
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // 添加最后一个字段
    result.push(current.trim());

    return result;
  }

  /**
   * 解析值（自动类型转换）
   */
  private parseValue(value: string): any {
    // 空值
    if (value === '' || value === 'null' || value === 'NULL') {
      return null;
    }

    // 布尔值
    if (value === 'true' || value === 'TRUE') return true;
    if (value === 'false' || value === 'FALSE') return false;

    // 数字
    const num = Number(value);
    if (!isNaN(num) && value !== '') {
      return num;
    }

    // 日期（简单判断）
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // 字符串
    return value;
  }

  /**
   * 转换为 ChartData 格式
   */
  private toChartData(headers: string[], rows: any[][]): SimpleChartData {
    if (rows.length === 0) {
      return { labels: [], datasets: [] };
    }

    // 假设第一列是标签，其余列是数据系列
    const labels = rows.map(row => row[0]);

    const datasets = headers.slice(1).map((name, colIndex) => ({
      name,
      data: rows.map(row => row[colIndex + 1]),
    }));

    return {
      labels,
      datasets,
    };
  }

  /**
   * 读取文件内容
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 导出为 CSV 字符串
   */
  export(data: SimpleChartData, options: CSVParseOptions = {}): string {
    const { delimiter = ',', hasHeader = true } = options;
    const lines: string[] = [];

    // 添加表头
    if (hasHeader && data.labels && data.datasets) {
      const headerRow = ['Label', ...data.datasets.map(d => d.name || 'Series')];
      lines.push(this.escapeCSVLine(headerRow, delimiter));
    }

    // 添加数据行
    if (data.labels && data.datasets) {
      const rowCount = data.labels.length;

      for (let i = 0; i < rowCount; i++) {
        const row = [
          String(data.labels[i]),
          ...data.datasets.map(d => String(d.data[i] ?? '')),
        ];
        lines.push(this.escapeCSVLine(row, delimiter));
      }
    }

    return lines.join('\n');
  }

  /**
   * 转义 CSV 行
   */
  private escapeCSVLine(values: string[], delimiter: string): string {
    return values.map(value => {
      // 如果值包含分隔符、引号或换行符，需要用引号包裹
      if (
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes('\n') ||
        value.includes('\r')
      ) {
        // 转义引号
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(delimiter);
  }

  /**
   * 推断列类型
   */
  inferColumnTypes(rows: any[][]): string[] {
    if (rows.length === 0) return [];

    const columnCount = rows[0].length;
    const types: string[] = [];

    for (let col = 0; col < columnCount; col++) {
      let hasNumber = false;
      let hasString = false;
      let hasDate = false;

      for (const row of rows) {
        const value = row[col];

        if (value === null || value === undefined) continue;

        if (typeof value === 'number') {
          hasNumber = true;
        } else if (value instanceof Date) {
          hasDate = true;
        } else {
          hasString = true;
        }
      }

      if (hasDate) {
        types.push('date');
      } else if (hasNumber && !hasString) {
        types.push('number');
      } else {
        types.push('string');
      }
    }

    return types;
  }

  /**
   * 验证 CSV 格式
   */
  validate(csvString: string, options: CSVParseOptions = {}): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!csvString || csvString.trim().length === 0) {
      errors.push('CSV 内容为空');
      return { valid: false, errors, warnings };
    }

    try {
      const data = this.parse(csvString, options);

      if (!data.labels || data.labels.length === 0) {
        warnings.push('没有数据行');
      }

      if (!data.datasets || data.datasets.length === 0) {
        warnings.push('没有数据列');
      }

      // 检查数据一致性
      if (data.datasets) {
        const lengths = data.datasets.map(d => d.data.length);
        const allSameLength = lengths.every(len => len === lengths[0]);

        if (!allSameLength) {
          errors.push('数据列长度不一致');
        }
      }

    } catch (error) {
      errors.push(`解析失败: ${(error as Error).message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// 导出单例
export const csvParser = new CSVParser();

