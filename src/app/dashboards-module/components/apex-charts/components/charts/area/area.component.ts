import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Row, Col } from '../../../interfaces/dashboard';
import { Dashboard } from '../../../classes/dashboardCommon';
import { ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html'
})
export class AreaComponent extends Dashboard implements OnInit {

  constructor() {
    super(Dashboard.getChartOptionsTemplate('area'));
  }

  @Input() chart: Col;
  @Input() row: Row;
  @Input()
  set filter(value) {
    if (value) this.updateOptions(value);
  }

  @ViewChild('chartComponent') chartComponent: ChartComponent;


  showChart = false;
  _series: any;
  _categories: any;
  _title: string;


  ngOnInit() {
    if (!this.chart) this.chart = this.row.cols[0];
    this.setSeries(this.chart.defaultValue);
    this.setCategories(this.chart.defaultValue);
    this.setTitle(this.chart.defaultValue, this.chart.title);
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions);
    this.chartOptions.series = (Array.isArray(this.series)) ? this.series : [this.series];
    this.chartOptions.xaxis.categories = this.categories;
    this.showChart = true;
    this.setFormatters();
  }

  updateOptions(value) {
    this.setSeries(value);
    this.setCategories(value);
    this.chartOptions.series = [this.series];
    this.chartOptions.xaxis.categories = this.categories;
    this.chartOptions.title.text = this.title;
    this.chartComponent.updateOptions(this.chartOptions);
  }


  setFormatters() {
    if (this.chart.formatters && this.chart.formatters.length) {
      for (const formatter of this.chart.formatters) {
        this.setFormatterType(formatter);
      }
    }

  }

  setFormatterType(formatter) {
    switch (formatter.type) {
      case 'percent&negatives':
        switch (formatter.field) {
          case 'tooltip-y':
            this.chartOptions.tooltip = {
              y: {
                formatter: (v, opts) => {
                  return v.toString().replace('-', '') + '%';
                }
              }
            };
            break;
          default:
            break;
        }

        break;

      default:
        break;
    }
  }

  filterChange(e, chart) {
    this.updateOptions(e);
  }

  sliderChange(e) {
    this.updateOptions(e);
  }

  setSeries(value) {
    const data = (value)
      ? this.chart.data[(typeof value === 'number') ? value + 'days' : value].data
      : (this.chart.data.hasOwnProperty('data'))
        ? this.chart.data.data
        : this.chart.data;
    if (this.chart.chartType === 'area') this._series = data.series;
  }

  setCategories(value) {
    this._categories = (value) ? this.chart.data[(typeof value === 'number') ? value + 'days' : value].categories : this.chart.data.categories;
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

}
