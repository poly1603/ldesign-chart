/**
 * 实时数据流处理
 * 支持 WebSocket、SSE（Server-Sent Events）、轮询等方式
 */

import type { ChartData, SimpleChartData } from '../types';
import { DataParser } from './data-parser';

export type StreamSource = 'websocket' | 'sse' | 'polling';

export interface StreamOptions {
  /** 数据源类型 */
  source: StreamSource;
  /** 连接 URL */
  url: string;
  /** 轮询间隔（毫秒），仅 polling 模式 */
  interval?: number;
  /** 缓冲区大小 */
  bufferSize?: number;
  /** 最大数据点数 */
  maxDataPoints?: number;
  /** 数据转换函数 */
  transform?: (data: any) => ChartData;
  /** 重连配置 */
  reconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
  };
}

export interface StreamEvent {
  type: 'data' | 'error' | 'open' | 'close';
  data?: any;
  error?: Error;
  timestamp: number;
}

export type StreamCallback = (event: StreamEvent) => void;

/**
 * 数据流管理器
 */
export class DataStreamManager {
  private source?: StreamSource;
  private url?: string;
  private connection?: WebSocket | EventSource;
  private pollingTimer?: ReturnType<typeof setInterval>;
  private callbacks: StreamCallback[] = [];
  private buffer: any[] = [];
  private options: StreamOptions;
  private isConnected = false;
  private reconnectAttempts = 0;
  private parser = new DataParser();

  constructor(options: StreamOptions) {
    this.options = {
      bufferSize: 1000,
      maxDataPoints: 10000,
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        delay: 3000,
      },
      ...options,
    };

    this.source = options.source;
    this.url = options.url;
  }

  /**
   * 连接数据流
   */
  connect(): void {
    if (this.isConnected) {
      console.warn('Already connected');
      return;
    }

    switch (this.source) {
      case 'websocket':
        this.connectWebSocket();
        break;
      case 'sse':
        this.connectSSE();
        break;
      case 'polling':
        this.startPolling();
        break;
      default:
        throw new Error(`Unsupported source: ${this.source}`);
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (!this.isConnected) return;

    if (this.connection) {
      if (this.connection instanceof WebSocket) {
        this.connection.close();
      } else if (this.connection instanceof EventSource) {
        this.connection.close();
      }
      this.connection = undefined;
    }

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }

    this.isConnected = false;
    this.emit({
      type: 'close',
      timestamp: Date.now(),
    });
  }

  /**
   * 订阅事件
   */
  on(callback: StreamCallback): () => void {
    this.callbacks.push(callback);

    // 返回取消订阅函数
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 获取缓冲区数据
   */
  getBuffer(): any[] {
    return [...this.buffer];
  }

  /**
   * 清空缓冲区
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * 获取最新数据（指定数量）
   */
  getLatestData(count: number): any[] {
    return this.buffer.slice(-count);
  }

  /**
   * WebSocket 连接
   */
  private connectWebSocket(): void {
    if (!this.url) {
      throw new Error('URL is required for WebSocket');
    }

    try {
      const ws = new WebSocket(this.url);

      ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit({
          type: 'open',
          timestamp: Date.now(),
        });
      };

      ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      ws.onerror = (error) => {
        this.emit({
          type: 'error',
          error: new Error('WebSocket error'),
          timestamp: Date.now(),
        });
      };

      ws.onclose = () => {
        this.isConnected = false;
        this.emit({
          type: 'close',
          timestamp: Date.now(),
        });

        // 尝试重连
        this.attemptReconnect();
      };

      this.connection = ws;
    } catch (error) {
      this.emit({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * SSE 连接
   */
  private connectSSE(): void {
    if (!this.url) {
      throw new Error('URL is required for SSE');
    }

    try {
      const eventSource = new EventSource(this.url);

      eventSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit({
          type: 'open',
          timestamp: Date.now(),
        });
      };

      eventSource.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      eventSource.onerror = (error) => {
        this.isConnected = false;
        this.emit({
          type: 'error',
          error: new Error('SSE error'),
          timestamp: Date.now(),
        });

        // SSE 会自动重连，但我们也可以手动控制
        this.attemptReconnect();
      };

      this.connection = eventSource;
    } catch (error) {
      this.emit({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 轮询
   */
  private startPolling(): void {
    if (!this.url) {
      throw new Error('URL is required for polling');
    }

    const interval = this.options.interval || 1000;

    const poll = async () => {
      try {
        const response = await fetch(this.url!);
        const data = await response.json();
        this.handleMessage(data);
      } catch (error) {
        this.emit({
          type: 'error',
          error: error as Error,
          timestamp: Date.now(),
        });
      }
    };

    // 立即执行一次
    poll();

    // 设置定时器
    this.pollingTimer = setInterval(poll, interval);
    this.isConnected = true;

    this.emit({
      type: 'open',
      timestamp: Date.now(),
    });
  }

  /**
   * 处理消息
   */
  private handleMessage(rawData: any): void {
    try {
      // 解析 JSON（如果是字符串）
      let data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      // 应用转换函数
      if (this.options.transform) {
        data = this.options.transform(data);
      }

      // 添加到缓冲区
      this.addToBuffer(data);

      // 触发回调
      this.emit({
        type: 'data',
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emit({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 添加到缓冲区
   */
  private addToBuffer(data: any): void {
    this.buffer.push(data);

    // 限制缓冲区大小
    const maxSize = this.options.bufferSize || 1000;
    if (this.buffer.length > maxSize) {
      this.buffer = this.buffer.slice(-maxSize);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: StreamEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Stream callback error:', error);
      }
    });
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    const reconnectConfig = this.options.reconnect;

    if (!reconnectConfig?.enabled) return;

    const maxAttempts = reconnectConfig.maxAttempts || 5;
    if (this.reconnectAttempts >= maxAttempts) {
      console.warn('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = reconnectConfig.delay || 3000;

    console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${maxAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay * this.reconnectAttempts); // 递增延迟
  }

  /**
   * 获取连接状态
   */
  isConnectedToStream(): boolean {
    return this.isConnected;
  }

  /**
   * 发送消息（仅 WebSocket）
   */
  send(message: any): void {
    if (this.connection instanceof WebSocket && this.isConnected) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      this.connection.send(data);
    } else {
      throw new Error('Send is only supported for WebSocket connections');
    }
  }
}

/**
 * 创建实时图表数据流（便捷方法）
 */
export function createChartStream(
  options: StreamOptions,
  onUpdate: (data: ChartData) => void
): DataStreamManager {
  const stream = new DataStreamManager(options);

  stream.on((event) => {
    if (event.type === 'data') {
      onUpdate(event.data);
    } else if (event.type === 'error') {
      console.error('Stream error:', event.error);
    }
  });

  return stream;
}

/**
 * 合并流数据（增量更新）
 */
export function mergeStreamData(
  currentData: SimpleChartData,
  newData: any,
  maxPoints = 100
): SimpleChartData {
  const result: SimpleChartData = {
    labels: [...(currentData.labels || [])],
    datasets: currentData.datasets.map(d => ({
      ...d,
      data: [...d.data],
    })),
  };

  // 添加新数据点
  if (Array.isArray(newData)) {
    // 新数据是数组：[value1, value2, ...]
    result.labels!.push(new Date().toISOString());
    newData.forEach((value, index) => {
      if (result.datasets[index]) {
        result.datasets[index].data.push(value);
      }
    });
  } else if (typeof newData === 'object') {
    // 新数据是对象：{ label: '...', values: [...] }
    result.labels!.push(newData.label || new Date().toISOString());
    (newData.values || []).forEach((value: any, index: number) => {
      if (result.datasets[index]) {
        result.datasets[index].data.push(value);
      }
    });
  }

  // 限制数据点数量
  if (result.labels!.length > maxPoints) {
    const excess = result.labels!.length - maxPoints;
    result.labels = result.labels!.slice(excess);
    result.datasets = result.datasets.map(d => ({
      ...d,
      data: d.data.slice(excess),
    }));
  }

  return result;
}

