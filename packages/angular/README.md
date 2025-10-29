# @ldesign/chart-angular

企业级图表 Angular 适配器

## 安装

```bash
pnpm add @ldesign/chart-angular echarts
```

## 使用

### 作为独立组件

```typescript
import { Component } from '@angular/core'
import { ChartComponent } from '@ldesign/chart-angular'

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ChartComponent],
  template: `
    <ldesign-chart
      type="line"
      [data]="chartData"
      title="销售趋势"
      [responsive]="true"
      (chartInit)="onChartInit($event)"
      (chartClick)="onChartClick($event)"
    />
  `,
})
export class DemoComponent {
  chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }],
  }

  onChartInit(chart: any) {
    console.log('Chart initialized', chart)
  }

  onChartClick(params: any) {
    console.log('Chart clicked', params)
  }
}
```

### 作为模块组件

```typescript
import { NgModule } from '@angular/core'
import { ChartComponent } from '@ldesign/chart-angular'

@NgModule({
  imports: [ChartComponent],
  exports: [ChartComponent],
})
export class ChartModule {}
```

## API

### 输入属性

- `type` - 图表类型
- `data` - 图表数据
- `title` - 图表标题
- `theme` - 主题
- `darkMode` - 暗黑模式
- `responsive` - 响应式
- `config` - 额外配置

### 输出事件

- `chartInit` - 图表初始化完成
- `chartClick` - 图表点击事件

### 方法

- `getChart()` - 获取图表实例
- `resize()` - 手动调整大小

## License

MIT
