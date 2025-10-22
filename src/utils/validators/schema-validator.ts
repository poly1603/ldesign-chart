/**
 * JSON Schema 数据验证器
 * 提供运行时数据验证和类型安全保障
 */

export type SchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'any';

export interface SchemaProperty {
  type: SchemaType | SchemaType[];
  required?: boolean;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  items?: Schema;
  properties?: Record<string, SchemaProperty>;
  default?: any;
  description?: string;
}

export interface Schema {
  type: SchemaType | SchemaType[];
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: Schema;
  additionalProperties?: boolean;
  description?: string;
}

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
  expected?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data: any;
}

export class SchemaValidator {
  /**
   * 验证数据
   */
  validate(data: any, schema: Schema): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateValue(data, schema, '', errors);

    return {
      valid: errors.length === 0,
      errors,
      data: this.applyDefaults(data, schema),
    };
  }

  /**
   * 验证单个值
   */
  private validateValue(
    value: any,
    schema: SchemaProperty | Schema,
    path: string,
    errors: ValidationError[]
  ): void {
    // 类型验证
    if (!this.validateType(value, schema.type)) {
      errors.push({
        path,
        message: `Expected type ${this.formatTypes(schema.type)}, got ${typeof value}`,
        value,
        expected: schema.type,
      });
      return;
    }

    // 枚举验证
    if ('enum' in schema && schema.enum) {
      if (!schema.enum.includes(value)) {
        errors.push({
          path,
          message: `Value must be one of: ${schema.enum.join(', ')}`,
          value,
          expected: schema.enum,
        });
      }
    }

    // 数字范围验证
    if (typeof value === 'number') {
      if ('minimum' in schema && schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          path,
          message: `Value must be >= ${schema.minimum}`,
          value,
          expected: `>= ${schema.minimum}`,
        });
      }
      if ('maximum' in schema && schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          path,
          message: `Value must be <= ${schema.maximum}`,
          value,
          expected: `<= ${schema.maximum}`,
        });
      }
    }

    // 字符串长度验证
    if (typeof value === 'string') {
      if ('minLength' in schema && schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({
          path,
          message: `String length must be >= ${schema.minLength}`,
          value,
        });
      }
      if ('maxLength' in schema && schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({
          path,
          message: `String length must be <= ${schema.maxLength}`,
          value,
        });
      }
      if ('pattern' in schema && schema.pattern && !schema.pattern.test(value)) {
        errors.push({
          path,
          message: `String does not match pattern: ${schema.pattern}`,
          value,
        });
      }
    }

    // 数组验证
    if (Array.isArray(value) && 'items' in schema && schema.items) {
      value.forEach((item, index) => {
        this.validateValue(item, schema.items!, `${path}[${index}]`, errors);
      });
    }

    // 对象验证
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      this.validateObject(value, schema as Schema, path, errors);
    }
  }

  /**
   * 验证对象
   */
  private validateObject(
    obj: Record<string, any>,
    schema: Schema,
    path: string,
    errors: ValidationError[]
  ): void {
    // 验证必需字段
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Required property "${key}" is missing`,
            value: undefined,
          });
        }
      }
    }

    // 验证属性
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          this.validateValue(
            obj[key],
            propSchema,
            path ? `${path}.${key}` : key,
            errors
          );
        } else if (propSchema.required) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Required property "${key}" is missing`,
            value: undefined,
          });
        }
      }

      // 验证额外属性
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(obj)) {
          if (!(key in schema.properties)) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: `Additional property "${key}" is not allowed`,
              value: obj[key],
            });
          }
        }
      }
    }
  }

  /**
   * 验证类型
   */
  private validateType(value: any, type: SchemaType | SchemaType[]): boolean {
    const types = Array.isArray(type) ? type : [type];

    return types.some(t => {
      switch (t) {
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number' && !isNaN(value);
        case 'boolean':
          return typeof value === 'boolean';
        case 'array':
          return Array.isArray(value);
        case 'object':
          return typeof value === 'object' && value !== null && !Array.isArray(value);
        case 'null':
          return value === null;
        case 'any':
          return true;
        default:
          return false;
      }
    });
  }

  /**
   * 格式化类型列表
   */
  private formatTypes(type: SchemaType | SchemaType[]): string {
    return Array.isArray(type) ? type.join(' | ') : type;
  }

  /**
   * 应用默认值
   */
  private applyDefaults(data: any, schema: Schema): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const result = Array.isArray(data) ? [...data] : { ...data };

    if (schema.properties && !Array.isArray(result)) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (!(key in result) && 'default' in propSchema) {
          result[key] = propSchema.default;
        } else if (key in result && propSchema.properties) {
          result[key] = this.applyDefaults(result[key], propSchema as Schema);
        }
      }
    }

    return result;
  }

  /**
   * 创建验证器（柯里化）
   */
  createValidator(schema: Schema): (data: any) => ValidationResult {
    return (data: any) => this.validate(data, schema);
  }
}

// 预定义的常用 Schema

/**
 * 图表数据 Schema
 */
export const chartDataSchema: Schema = {
  type: 'object',
  properties: {
    labels: {
      type: 'array',
      items: { type: ['string', 'number'] },
      description: '图表标签',
    },
    datasets: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          data: {
            type: 'array',
            required: true,
            items: { type: 'number' },
          },
          color: { type: 'string' },
        },
      },
      description: '数据集',
    },
  },
  required: ['datasets'],
};

/**
 * 图表配置 Schema
 */
export const chartConfigSchema: Schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      required: true,
      enum: ['line', 'bar', 'pie', 'scatter', 'radar', 'waterfall', 'funnel'],
      description: '图表类型',
    },
    title: {
      type: ['string', 'object'],
      description: '图表标题',
    },
    theme: {
      type: 'string',
      enum: ['light', 'dark'],
      default: 'light',
      description: '主题',
    },
    responsive: {
      type: 'boolean',
      default: true,
      description: '是否响应式',
    },
    cache: {
      type: 'boolean',
      default: false,
      description: '是否启用缓存',
    },
    fontSize: {
      type: 'number',
      minimum: 8,
      maximum: 72,
      default: 12,
      description: '字体大小',
    },
  },
  required: ['type'],
};

// 导出单例
export const schemaValidator = new SchemaValidator();

