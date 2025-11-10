/**
 * AI 智能配置生成器
 * 基于数据特征自动生成最优图表配置
 */

import type { ChartConfig, ChartData, ChartType } from '../types';
import type { UniversalChartConfig } from '../engines/types';

/**
 * 数据特征分析结果
 */
interface DataFeatures {
  /** 数据行数 */
  rowCount: number;
  /** 数据列数 */
  columnCount: number;
  /** 数据类型分布 */
  dataTypes: {
    numeric: number;
    categorical: number;
    temporal: number;
    text: number;
  };
  /** 数据分布特征 */
  distribution: {
    isNormal: boolean;
    hasOutliers: boolean;
    skewness: number;
    kurtosis: number;
  };
  /** 数据关系 */
  relationships: {
    hasCorrelation: boolean;
    hasTrend: boolean;
    hasCyclical: boolean;
    hasHierarchy: boolean;
  };
  /** 数据规模 */
  scale: 'small' | 'medium' | 'large' | 'huge';
  /** 推荐的可视化目的 */
  purpose: 'comparison' | 'distribution' | 'relationship' | 'composition' | 'trend';
}

/**
 * AI 配置推荐结果
 */
interface AIRecommendation {
  /** 推荐的图表类型 */
  chartType: ChartType | string;
  /** 推荐理由 */
  reason: string;
  /** 置信度 (0-1) */
  confidence: number;
  /** 配置选项 */
  config: Partial<UniversalChartConfig>;
  /** 备选方案 */
  alternatives?: Array<{
    chartType: ChartType | string;
    reason: string;
    confidence: number;
  }>;
}

/**
 * AI 智能配置生成器类
 */
export class AIConfigGenerator {
  /**
   * 分析数据特征
   */
  analyzeData(data: ChartData): DataFeatures {
    const features: DataFeatures = {
      rowCount: 0,
      columnCount: 0,
      dataTypes: {
        numeric: 0,
        categorical: 0,
        temporal: 0,
        text: 0,
      },
      distribution: {
        isNormal: false,
        hasOutliers: false,
        skewness: 0,
        kurtosis: 0,
      },
      relationships: {
        hasCorrelation: false,
        hasTrend: false,
        hasCyclical: false,
        hasHierarchy: false,
      },
      scale: 'small',
      purpose: 'comparison',
    };

    // 分析数据结构
    if (Array.isArray(data)) {
      features.rowCount = data.length;
      if (data.length > 0) {
        features.columnCount = this.getColumnCount(data[0]);
        this.analyzeDataTypes(data, features);
        this.analyzeDistribution(data, features);
        this.analyzeRelationships(data, features);
      }
    } else if (typeof data === 'object' && data) {
      if ('datasets' in data) {
        features.rowCount = data.datasets.length;
        features.columnCount = data.labels?.length || 0;
      }
    }

    // 判断数据规模
    features.scale = this.getDataScale(features.rowCount * features.columnCount);

    // 推断可视化目的
    features.purpose = this.inferPurpose(features);

    return features;
  }

  /**
   * 根据数据特征推荐图表配置
   */
  recommend(data: ChartData, userPreferences?: Partial<ChartConfig>): AIRecommendation {
    const features = this.analyzeData(data);
    
    // 基于规则的推荐引擎
    const recommendation = this.ruleBasedRecommendation(features, userPreferences);
    
    // 优化配置
    recommendation.config = this.optimizeConfig(recommendation.config, features);
    
    // 生成备选方案
    recommendation.alternatives = this.generateAlternatives(features, recommendation.chartType);
    
    return recommendation;
  }

  /**
   * 基于规则的图表推荐
   */
  private ruleBasedRecommendation(
    features: DataFeatures,
    preferences?: Partial<ChartConfig>
  ): AIRecommendation {
    let chartType: ChartType | string = 'bar';
    let reason = '';
    let confidence = 0.5;
    const config: Partial<UniversalChartConfig> = {};

    // 根据可视化目的选择图表
    switch (features.purpose) {
      case 'comparison':
        if (features.columnCount <= 3 && features.rowCount <= 10) {
          chartType = 'bar';
          reason = '数据量适中，适合使用柱状图进行比较';
          confidence = 0.9;
        } else if (features.rowCount > 10) {
          chartType = 'line';
          reason = '数据点较多，折线图更适合展示趋势';
          confidence = 0.85;
        }
        break;

      case 'distribution':
        if (features.distribution.isNormal) {
          chartType = 'scatter';
          reason = '数据呈正态分布，散点图可以很好地展示分布特征';
          confidence = 0.88;
        } else if (features.dataTypes.categorical > features.dataTypes.numeric) {
          chartType = 'pie';
          reason = '分类数据较多，饼图适合展示占比分布';
          confidence = 0.82;
        } else {
          chartType = 'heatmap';
          reason = '热力图可以直观展示数据密度分布';
          confidence = 0.75;
        }
        break;

      case 'relationship':
        if (features.relationships.hasCorrelation) {
          chartType = 'scatter';
          reason = '数据存在相关性，散点图最适合展示变量关系';
          confidence = 0.92;
          config.series = [{
            type: 'scatter',
            symbolSize: 10,
          }];
        } else if (features.relationships.hasHierarchy) {
          chartType = 'treemap';
          reason = '数据具有层级结构，树图可以清晰展示层次关系';
          confidence = 0.87;
        }
        break;

      case 'composition':
        if (features.rowCount <= 6) {
          chartType = 'pie';
          reason = '类别数量适中，饼图清晰展示组成比例';
          confidence = 0.9;
        } else if (features.rowCount <= 12) {
          chartType = 'donut';
          reason = '环形图比饼图更适合展示较多类别';
          confidence = 0.85;
        } else {
          chartType = 'treemap';
          reason = '类别较多，树图可以更好地利用空间';
          confidence = 0.8;
        }
        break;

      case 'trend':
        if (features.relationships.hasTrend) {
          chartType = 'line';
          reason = '数据有明显趋势，折线图最适合展示时间序列';
          confidence = 0.95;
          config.smooth = true;
        } else if (features.relationships.hasCyclical) {
          chartType = 'radar';
          reason = '数据具有周期性，雷达图可以展示多维度变化';
          confidence = 0.83;
        }
        break;
    }

    // 应用用户偏好
    if (preferences?.type) {
      chartType = preferences.type;
      confidence *= 0.8; // 降低置信度，因为这是用户指定的
      reason += '（用户指定）';
    }

    // 设置性能优化选项
    if (features.scale === 'large' || features.scale === 'huge') {
      config.virtual = true;
      config.lazy = true;
      config.worker = true;
    }

    return {
      chartType,
      reason,
      confidence,
      config: {
        type: chartType,
        ...config,
      },
    };
  }

  /**
   * 优化配置
   */
  private optimizeConfig(
    config: Partial<UniversalChartConfig>,
    features: DataFeatures
  ): Partial<UniversalChartConfig> {
    const optimized = { ...config };

    // 大数据优化
    if (features.scale === 'large' || features.scale === 'huge') {
      optimized.animation = false; // 关闭动画
      optimized.dataZoom = [
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 30, // 只显示30%的数据
        },
        {
          type: 'inside',
        },
      ];
    }

    // 响应式配置
    optimized.responsive = {
      debounce: 200,
      rules: [
        {
          condition: { maxWidth: 600 },
          option: {
            legend: { position: 'bottom' },
            grid: { left: 20, right: 20 },
          },
        },
      ],
    };

    // 颜色方案
    if (!optimized.colors) {
      optimized.colors = this.selectColorScheme(features);
    }

    // 交互增强
    optimized.tooltip = {
      trigger: 'item',
      formatter: this.getTooltipFormatter(config.type as string),
    };

    return optimized;
  }

  /**
   * 生成备选方案
   */
  private generateAlternatives(
    features: DataFeatures,
    primaryType: string
  ): AIRecommendation['alternatives'] {
    const alternatives: AIRecommendation['alternatives'] = [];
    
    const candidateTypes = this.getCandidateChartTypes(features.purpose);
    
    for (const type of candidateTypes) {
      if (type !== primaryType) {
        alternatives.push({
          chartType: type,
          reason: this.getChartReason(type, features),
          confidence: this.calculateConfidence(type, features),
        });
      }
    }

    return alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * 获取候选图表类型
   */
  private getCandidateChartTypes(purpose: string): string[] {
    const candidates: Record<string, string[]> = {
      comparison: ['bar', 'column', 'line', 'radar'],
      distribution: ['scatter', 'heatmap', 'boxplot', 'histogram'],
      relationship: ['scatter', 'bubble', 'network', 'sankey'],
      composition: ['pie', 'donut', 'treemap', 'sunburst'],
      trend: ['line', 'area', 'stream', 'candlestick'],
    };
    
    return candidates[purpose] || ['bar', 'line', 'pie'];
  }

  /**
   * 获取图表推荐理由
   */
  private getChartReason(type: string, features: DataFeatures): string {
    const reasons: Record<string, string> = {
      bar: '柱状图直观展示类别间的比较',
      line: '折线图清晰展示数据趋势',
      pie: '饼图展示各部分占比关系',
      scatter: '散点图展示变量间的相关性',
      heatmap: '热力图展示数据密度和分布',
      radar: '雷达图展示多维数据对比',
      treemap: '树图展示层级和占比关系',
      bubble: '气泡图展示三维数据关系',
    };
    
    return reasons[type] || `${type}图表适合当前数据特征`;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(type: string, features: DataFeatures): number {
    let confidence = 0.5;
    
    // 基于数据规模调整
    if (features.scale === 'small' || features.scale === 'medium') {
      confidence += 0.1;
    }
    
    // 基于数据类型匹配度
    if (this.isTypeMatchingData(type, features)) {
      confidence += 0.2;
    }
    
    // 基于目的匹配度
    if (this.isTypeMatchingPurpose(type, features.purpose)) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 0.95);
  }

  /**
   * 选择颜色方案
   */
  private selectColorScheme(features: DataFeatures): string[] {
    // 根据数据特征选择合适的颜色方案
    if (features.dataTypes.categorical > features.dataTypes.numeric) {
      // 分类数据使用对比色
      return [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc',
      ];
    } else {
      // 数值数据使用渐变色
      return [
        '#313695',
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
      ];
    }
  }

  // === 辅助方法 ===

  private getColumnCount(item: any): number {
    if (typeof item === 'object') {
      return Object.keys(item).length;
    }
    return 1;
  }

  private analyzeDataTypes(data: any[], features: DataFeatures): void {
    // 简化的数据类型分析
    for (const item of data.slice(0, 100)) { // 采样分析
      if (typeof item === 'number') {
        features.dataTypes.numeric++;
      } else if (typeof item === 'string') {
        if (this.isDateString(item)) {
          features.dataTypes.temporal++;
        } else {
          features.dataTypes.categorical++;
        }
      }
    }
  }

  private analyzeDistribution(data: any[], features: DataFeatures): void {
    // 简化的分布分析
    if (data.length > 10) {
      const numbers = data.filter(d => typeof d === 'number');
      if (numbers.length > 0) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
        features.distribution.isNormal = variance > 0 && variance < mean * 2;
      }
    }
  }

  private analyzeRelationships(data: any[], features: DataFeatures): void {
    // 简化的关系分析
    if (data.length > 2) {
      // 检测趋势
      const isIncreasing = data.every((val, i, arr) => 
        i === 0 || (typeof val === 'number' && typeof arr[i-1] === 'number' && val >= arr[i-1])
      );
      features.relationships.hasTrend = isIncreasing;
    }
  }

  private getDataScale(totalPoints: number): DataFeatures['scale'] {
    if (totalPoints < 100) return 'small';
    if (totalPoints < 1000) return 'medium';
    if (totalPoints < 10000) return 'large';
    return 'huge';
  }

  private inferPurpose(features: DataFeatures): DataFeatures['purpose'] {
    if (features.relationships.hasTrend) return 'trend';
    if (features.relationships.hasCorrelation) return 'relationship';
    if (features.distribution.isNormal) return 'distribution';
    if (features.dataTypes.categorical > features.dataTypes.numeric) return 'composition';
    return 'comparison';
  }

  private isDateString(str: string): boolean {
    return !isNaN(Date.parse(str));
  }

  private isTypeMatchingData(type: string, features: DataFeatures): boolean {
    const numericTypes = ['line', 'scatter', 'bubble', 'heatmap'];
    const categoricalTypes = ['bar', 'pie', 'donut', 'treemap'];
    
    if (numericTypes.includes(type) && features.dataTypes.numeric > features.dataTypes.categorical) {
      return true;
    }
    if (categoricalTypes.includes(type) && features.dataTypes.categorical >= features.dataTypes.numeric) {
      return true;
    }
    return false;
  }

  private isTypeMatchingPurpose(type: string, purpose: string): boolean {
    const purposeMap: Record<string, string[]> = {
      comparison: ['bar', 'column', 'radar'],
      distribution: ['scatter', 'heatmap', 'boxplot'],
      relationship: ['scatter', 'bubble', 'network'],
      composition: ['pie', 'donut', 'treemap'],
      trend: ['line', 'area', 'candlestick'],
    };
    
    return purposeMap[purpose]?.includes(type) || false;
  }

  private getTooltipFormatter(type: string): string | Function {
    // 返回适合图表类型的 tooltip 格式化器
    return (params: any) => {
      if (Array.isArray(params)) {
        return params.map(p => `${p.seriesName}: ${p.value}`).join('<br/>');
      }
      return `${params.name}: ${params.value}`;
    };
  }
}

// 导出单例
export const aiConfigGenerator = new AIConfigGenerator();