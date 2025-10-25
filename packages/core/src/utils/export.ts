/**
 * 图表导出工具
 * 支持导出为 PNG、JPEG、SVG、PDF，以及导出数据为 CSV、JSON
 */

import type { EChartsInstance } from '../types';
import type { SimpleChartData } from '../types';
import { csvParser } from './parsers/csv-parser';

export interface ExportImageOptions {
  /** 图片类型 */
  type?: 'png' | 'jpeg' | 'svg';
  /** 图片质量 (0-1)，仅 JPEG 有效 */
  quality?: number;
  /** 背景色，默认白色 */
  backgroundColor?: string;
  /** 像素比，默认为设备像素比 */
  pixelRatio?: number;
  /** 是否排除组件（如工具箱） */
  excludeComponents?: string[];
}

export interface ExportPDFOptions {
  /** 页面方向 */
  orientation?: 'portrait' | 'landscape';
  /** 页面大小 */
  format?: 'a4' | 'a3' | 'letter';
  /** 标题 */
  title?: string;
  /** 是否包含多个图表 */
  charts?: EChartsInstance[];
  /** 每页图表数 */
  chartsPerPage?: number;
}

export interface ExportDataOptions {
  /** 数据格式 */
  format?: 'csv' | 'json' | 'xlsx';
  /** 文件名 */
  filename?: string;
  /** 是否包含表头 */
  includeHeader?: boolean;
  /** 是否下载文件 */
  download?: boolean;
}

export class ChartExporter {
  /**
   * 导出图表为图片
   */
  exportImage(
    chart: EChartsInstance,
    options: ExportImageOptions = {}
  ): string {
    const {
      type = 'png',
      quality,
      backgroundColor = '#ffffff',
      pixelRatio = window.devicePixelRatio || 1,
      excludeComponents,
    } = options;

    // 获取 DataURL
    const dataURL = chart.getDataURL({
      type,
      pixelRatio,
      backgroundColor,
      excludeComponents,
      ...(type === 'jpeg' && quality !== undefined ? { quality } : {}),
    });

    return dataURL;
  }

  /**
   * 下载图表为图片文件
   */
  downloadImage(
    chart: EChartsInstance,
    filename = 'chart',
    options: ExportImageOptions = {}
  ): void {
    const dataURL = this.exportImage(chart, options);
    const type = options.type || 'png';

    this.downloadFile(dataURL, `${filename}.${type}`);
  }

  /**
   * 导出为 SVG（特殊处理）
   */
  exportSVG(chart: EChartsInstance): string {
    // ECharts 需要使用 SVG 渲染器才能导出 SVG
    const dataURL = this.exportImage(chart, { type: 'svg' });

    // 解码 SVG
    if (dataURL.startsWith('data:image/svg+xml;')) {
      const base64 = dataURL.split(',')[1];
      return atob(base64);
    }

    return '';
  }

  /**
   * 导出多个图表为 PDF
   */
  async exportPDF(
    charts: EChartsInstance[],
    options: ExportPDFOptions = {}
  ): Promise<Blob> {
    const {
      orientation = 'portrait',
      format = 'a4',
      title,
      chartsPerPage = 2,
    } = options;

    // 注意：这里需要额外的 PDF 库（如 jsPDF）
    // 这里提供一个简化的实现框架

    throw new Error('PDF export requires jsPDF library. Please install it first.');

    // 完整实现示例（需要 jsPDF）:
    /*
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, 10, 10);
    }

    let yOffset = title ? 20 : 10;
    
    for (let i = 0; i < charts.length; i++) {
      const dataURL = this.exportImage(charts[i], { type: 'jpeg', quality: 0.9 });
      
      const imgWidth = orientation === 'portrait' ? 190 : 277;
      const imgHeight = (imgWidth * 9) / 16; // 16:9 比例
      
      if (i > 0 && i % chartsPerPage === 0) {
        pdf.addPage();
        yOffset = 10;
      }
      
      pdf.addImage(dataURL, 'JPEG', 10, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }

    return pdf.output('blob');
    */
  }

  /**
   * 导出数据
   */
  exportData(
    data: SimpleChartData,
    options: ExportDataOptions = {}
  ): string | Blob {
    const {
      format = 'csv',
      filename = 'chart-data',
      includeHeader = true,
      download = true,
    } = options;

    let content: string | Blob;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = csvParser.export(data, { hasHeader: includeHeader });
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;

      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
        break;

      case 'xlsx':
        throw new Error('XLSX export requires additional library (e.g., xlsx)');

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    if (download) {
      this.downloadFile(
        new Blob([content], { type: mimeType }),
        `${filename}.${extension}`
      );
    }

    return content;
  }

  /**
   * 下载文件（通用方法）
   */
  private downloadFile(content: string | Blob, filename: string): void {
    let url: string;

    if (typeof content === 'string') {
      // DataURL 或普通字符串
      if (content.startsWith('data:')) {
        url = content;
      } else {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        url = URL.createObjectURL(blob);
      }
    } else {
      // Blob
      url = URL.createObjectURL(content);
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放 URL
    if (!content.toString().startsWith('data:')) {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }

  /**
   * 复制图表到剪贴板
   */
  async copyToClipboard(chart: EChartsInstance): Promise<void> {
    const dataURL = this.exportImage(chart, { type: 'png' });

    // 转换为 Blob
    const response = await fetch(dataURL);
    const blob = await response.blob();

    // 写入剪贴板
    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } else {
      throw new Error('Clipboard API not supported');
    }
  }

  /**
   * 打印图表
   */
  print(chart: EChartsInstance, options: ExportImageOptions = {}): void {
    const dataURL = this.exportImage(chart, {
      ...options,
      type: 'jpeg',
      quality: 0.9,
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Chart</title>
          <style>
            @media print {
              body { margin: 0; }
              img { max-width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  /**
   * 批量导出多个图表
   */
  async exportMultiple(
    charts: Array<{ chart: EChartsInstance; filename: string }>,
    options: ExportImageOptions = {}
  ): Promise<void> {
    for (const { chart, filename } of charts) {
      this.downloadImage(chart, filename, options);
      // 添加延迟，避免浏览器阻止下载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 导出为 Base64
   */
  exportBase64(
    chart: EChartsInstance,
    options: ExportImageOptions = {}
  ): string {
    return this.exportImage(chart, options);
  }
}

// 导出单例
export const chartExporter = new ChartExporter();

