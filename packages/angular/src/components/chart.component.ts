import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core'
import type { Chart as ChartCore, ChartConfig, ChartData } from '@ldesign/chart-core'
import { createChart } from '@ldesign/chart-core'

@Component({
  selector: 'ldesign-chart',
  template: '<div #chartContainer style="width: 100%; height: 100%;"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>

  @Input() type!: ChartConfig['type']
  @Input() data!: ChartData
  @Input() title?: string
  @Input() theme?: string
  @Input() darkMode?: boolean
  @Input() responsive?: boolean
  @Input() config?: Partial<ChartConfig>

  @Output() chartInit = new EventEmitter<ChartCore>()
  @Output() chartClick = new EventEmitter<any>()

  private chart?: ChartCore

  ngOnInit(): void {
    this.initChart()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      if (changes['data'] && !changes['data'].firstChange) {
        this.chart.updateData(changes['data'].currentValue)
      }
      if (changes['theme'] && !changes['theme'].firstChange) {
        this.chart.setTheme(changes['theme'].currentValue)
      }
      if (changes['darkMode'] && !changes['darkMode'].firstChange) {
        this.chart.setDarkMode(changes['darkMode'].currentValue)
      }
    }
  }

  ngOnDestroy(): void {
    this.chart?.dispose()
  }

  private initChart(): void {
    if (!this.chartContainer?.nativeElement)
      return

    const chartConfig: ChartConfig = {
      type: this.type,
      data: this.data,
      title: this.title,
      theme: this.theme,
      darkMode: this.darkMode,
      responsive: this.responsive,
      ...this.config,
    }

    this.chart = createChart(this.chartContainer.nativeElement, chartConfig)

    this.chart.on('click', (params: any) => {
      this.chartClick.emit(params)
    })

    this.chartInit.emit(this.chart)
  }

  getChart(): ChartCore | undefined {
    return this.chart
  }

  resize(): void {
    this.chart?.resize()
  }
}
