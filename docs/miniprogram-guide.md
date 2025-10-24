# @ldesign/chart 小程序开发指南

> 使用 VChart 引擎在小程序中创建强大的数据可视化

---

## 🎯 概述

@ldesign/chart 通过 VChart 引擎为小程序提供完整的图表支持，包括：

- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 字节跳动小程序
- ✅ QQ 小程序

---

## 📦 安装

```bash
npm install @ldesign/chart @visactor/vchart
```

---

## 🚀 微信小程序

### 1. 基础用法

#### WXML

```xml
<canvas
  type="2d"
  id="chart"
  style="width: 100%; height: 400px;"
></canvas>
```

#### JavaScript

```javascript
import { createWechatChart } from '@ldesign/chart';

Page({
  onReady() {
    // 获取 Canvas 节点
    const query = wx.createSelectorQuery();
    query
      .select('#chart')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        // 设置 Canvas 尺寸
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        // 创建图表
        const chart = createWechatChart({
          canvas,
          context: ctx,
          pixelRatio: dpr,
          type: 'line',
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
              name: '销售额',
              data: [120, 200, 150, 80, 70, 110]
            }]
          },
          title: '月度销售趋势',
        });
      });
  }
});
```

### 2. 完整示例

```javascript
import { WechatMiniProgramAdapter } from '@ldesign/chart';

Page({
  data: {
    chart: null,
  },
  
  onReady() {
    this.initChart();
  },
  
  initChart() {
    const query = wx.createSelectorQuery().in(this);
    
    query
      .select('#chart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const systemInfo = wx.getSystemInfoSync();
        const dpr = systemInfo.pixelRatio;
        
        // 设置 Canvas 实际尺寸
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        // 创建图表
        const chart = WechatMiniProgramAdapter.createChart({
          canvas,
          context: ctx,
          pixelRatio: dpr,
          
          // 图表配置
          type: 'bar',
          data: {
            labels: ['产品A', '产品B', '产品C', '产品D'],
            datasets: [{
              name: '销量',
              data: [120, 200, 150, 300]
            }]
          },
          title: '产品销量对比',
          colors: ['#5470c6', '#91cc75'],
        });
        
        this.setData({ chart });
      });
  },
  
  // 更新数据
  updateChart() {
    if (this.data.chart) {
      this.data.chart.updateData({
        labels: ['产品A', '产品B', '产品C', '产品D'],
        datasets: [{
          name: '销量',
          data: [150, 180, 200, 280]
        }]
      });
    }
  },
  
  onUnload() {
    // 销毁图表
    if (this.data.chart) {
      this.data.chart.dispose();
    }
  }
});
```

---

## 🔵 支付宝小程序

### 1. 基础用法

#### AXML

```xml
<canvas
  id="chart"
  type="2d"
  style="width: 100%; height: 400px;"
></canvas>
```

#### JavaScript

```javascript
import { createAlipayChart } from '@ldesign/chart';

Page({
  onReady() {
    my.createSelectorQuery()
      .select('#chart')
      .node()
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const systemInfo = my.getSystemInfoSync();
        const dpr = systemInfo.pixelRatio;
        
        canvas.width = systemInfo.windowWidth * dpr;
        canvas.height = 400 * dpr;
        ctx.scale(dpr, dpr);
        
        const chart = createAlipayChart({
          canvas,
          context: ctx,
          pixelRatio: dpr,
          type: 'pie',
          data: {
            labels: ['苹果', '香蕉', '橙子', '葡萄'],
            datasets: [{
              data: [30, 25, 25, 20]
            }]
          },
          title: '水果销售占比',
        });
      });
  }
});
```

---

## 🎨 支持的图表类型

### 基础图表

```javascript
// 折线图
createWechatChart({
  type: 'line',
  data: myData,
});

// 柱状图
createWechatChart({
  type: 'bar',
  data: myData,
});

// 饼图
createWechatChart({
  type: 'pie',
  data: myData,
});

// 散点图
createWechatChart({
  type: 'scatter',
  data: myData,
});

// 雷达图
createWechatChart({
  type: 'radar',
  data: myData,
});
```

### 高级图表（VChart 专属）

```javascript
// 3D 柱状图
createWechatChart({
  type: '3d-bar',
  data: myData,
});

// 旭日图
createWechatChart({
  type: 'sunburst',
  data: hierarchicalData,
});

// 桑基图
createWechatChart({
  type: 'sankey',
  data: flowData,
});
```

---

## 🎯 配置选项

### 完整配置示例

```javascript
createWechatChart({
  // Canvas 相关（必需）
  canvas: canvasNode,
  context: ctx,
  pixelRatio: dpr,
  
  // 图表类型（必需）
  type: 'line',
  
  // 数据（必需）
  data: {
    labels: ['1月', '2月', '3月'],
    datasets: [{
      name: '销售额',
      data: [100, 200, 150]
    }]
  },
  
  // 标题
  title: '销售趋势',
  
  // 图例
  legend: true,
  
  // 提示框
  tooltip: true,
  
  // 颜色
  colors: ['#5470c6', '#91cc75', '#fac858'],
  
  // 字体大小
  fontSize: 12,
  
  // 主题
  darkMode: false,
  
  // 动画
  animation: true,
});
```

---

## 💡 最佳实践

### 1. 响应式设计

```javascript
Page({
  onReady() {
    this.initChart();
  },
  
  onResize() {
    // 窗口大小改变时重新初始化图表
    if (this.data.chart) {
      this.data.chart.resize();
    }
  },
  
  initChart() {
    // 获取窗口信息
    const systemInfo = wx.getSystemInfoSync();
    
    // 计算图表尺寸
    const chartWidth = systemInfo.windowWidth - 40; // 留边距
    const chartHeight = 300;
    
    // 创建图表...
  }
});
```

### 2. 性能优化

```javascript
// 数据量大时，考虑采样
const chart = createWechatChart({
  type: 'line',
  data: {
    labels: largeLabels,
    datasets: [{
      data: largeData.slice(0, 100) // 只显示前100个数据点
    }]
  },
  animation: false, // 关闭动画提升性能
});
```

### 3. 内存管理

```javascript
Page({
  data: {
    chart: null
  },
  
  onUnload() {
    // 页面卸载时务必销毁图表
    if (this.data.chart) {
      this.data.chart.dispose();
      this.setData({ chart: null });
    }
  }
});
```

---

## 🐛 常见问题

### Q: 图表不显示？

**A**: 检查以下几点：

1. Canvas 类型必须是 `type="2d"`
2. 正确设置了 canvas 的宽高和 pixelRatio
3. 确保在 `onReady` 生命周期中初始化

### Q: 图表模糊？

**A**: 确保正确设置了设备像素比：

```javascript
const dpr = wx.getSystemInfoSync().pixelRatio;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

### Q: 如何更新数据？

**A**: 使用 `updateData` 方法：

```javascript
chart.updateData({
  labels: newLabels,
  datasets: [{
    data: newData
  }]
});
```

### Q: 支持交互吗？

**A**: 支持！VChart 在小程序中支持触摸交互：

```javascript
createWechatChart({
  type: 'line',
  data: myData,
  tooltip: true, // 启用提示框
  // 小程序会自动处理触摸事件
});
```

---

## 📚 更多资源

- [VChart 官方文档](https://www.visactor.io/vchart)
- [微信小程序 Canvas 文档](https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html)
- [支付宝小程序 Canvas 文档](https://opendocs.alipay.com/mini/component/canvas)

---

## 🔗 相关链接

- [快速开始](./GETTING_STARTED.md)
- [双引擎指南](./dual-engine-guide.md)
- [API 文档](./api-reference.md)

---

**最后更新**: 2025-10-24


