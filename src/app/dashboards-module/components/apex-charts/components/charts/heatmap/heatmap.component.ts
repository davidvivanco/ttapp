import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { Chart } from '../../../interfaces/chart';
import { ChartComponent } from 'ng-apexcharts';
import { Col } from '../../../interfaces/dashboard';
import { Dashboard } from '../../../classes/dashboardCommon';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html'
})
export class HeatmapComponent extends Dashboard implements OnInit, Chart {

  @Input() responsive: boolean;
  @Input() chart: Col;
  @Input()
  set filter(value) {
    if (value) this.updateOptions(value);
  }

  @ViewChild('chartComponent') chartComponent: ChartComponent;

  _series: any;
  _categories: any;
  _title: string;

  constructor() {
    super(Dashboard.getChartOptionsTemplate('heatmap'));
  }

  ngOnInit() {
    this.responsive = true;
    this.setSeries(this.chart.defaultValue);
    this.setTitle(this.chart.defaultValue, this.chart.title);
    this.chartOptions.series = this.series;
    this.chartOptions.title.text = this.chart.title.toUpperCase();
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions);
    this.chartOptions.yaxis.labels = {
      style: {
        fontSize: '14px'
      },
      formatter: (v) => (v.toString().length > 20) ? v.toString().slice(0, 20) + '...' : v.toString()
    };
    if (this.chart.formatters) {
      this.chartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
        return this.chart.formatters[0].custom.replace('|NAME|', w.config.series[seriesIndex].name);
      };
    }
  }

  updateOptions(value) {
    this.setSeries(value);
    this.setTitle(value, this.chart.title);
    this.chartOptions.series = this.series;
    this.chartOptions.title.text = (this.title) ? this.title.toUpperCase() : '';
    this.chartComponent.updateOptions(this.chartOptions);
  }


  filterChange(e, chart) {
    this.updateOptions(e);
  }

  sliderChange(e) {
    this.updateOptions(e);
  }

  setSeries(value) {
    const series = this.chart.data[(typeof value === 'number') ? value + 'days' : value];
    this._series = series.map(s => ({ data: s.data, name: s.name }));
  }

  setCategories(value) {
    this._categories = this.chart.data[(typeof value === 'number') ? value + 'days' : value].categories;
  }

  setTitle(value, title) {
    this._title = title;
  }


  get series() {
    return this._series;
  }

  get categories() {
    return this._categories;
  }

  get title() {
    return this._title;
  }

  setChartSize(beforeContentInit = false) {
    const innerWidth = this.innerWidth;
    if (innerWidth < 360) {
      this.chartOptions.chart.width = 80;
    } else if (innerWidth > 360 && innerWidth < 400) {
      this.chartOptions.chart.width = 100;
    } else if (innerWidth > 400 && innerWidth < 450) {
      this.chartOptions.chart.width = 150;
    } else if (innerWidth >= 450 && innerWidth < 575) {
      this.chartOptions.chart.width = 200;
    } else if (innerWidth >= 575 && innerWidth <= 767) {
      this.chartOptions.chart.width = 595;
    } else {
      this.chartOptions.chart.width = 695;
    }

    if (!beforeContentInit) {
      this.chartComponent.updateOptions(this.chartOptions);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.responsive) this.setChartSize(false);
  }
}
