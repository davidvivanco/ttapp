import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { Row, Col } from '../../../interfaces/dashboard';
import { Dashboard } from '../../../classes/dashboardCommon';
import { MatDialog } from '@angular/material';
import { GridModalComponent } from './modals/grid-modal/grid-modal.component';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html'
})
export class BarComponent extends Dashboard implements OnInit {

  @Input() responsive: boolean;
  @Input() chart: Col;
  @Input() row: Row;
  @Input() dashboardId: string;
  @Input()
  set filter(value) {
    if (value) this.updateOptions(value);
  }

  showChart = false;
  _series: any;
  _categories: any;
  _title: string;

  @ViewChild('chartComponent') chartComponent: ChartComponent;

  constructor(public dialog: MatDialog) {
    super(Dashboard.getChartOptionsTemplate('bar'));
  }

  ngOnInit() {
    this.responsive = true;
    if (!this.chart) this.chart = this.row.cols[0];
    this.setSeries(this.chart.defaultValue);
    this.setCategories(this.chart.defaultValue);
    this.setTitle(this.chart.defaultValue, this.chart.title);
    this.chartOptions.series = (Array.isArray(this.series)) ? this.series : [this.series];
    this.chartOptions.xaxis.categories = this.categories;
    this.chartOptions.labels = this.categories;
    this.chartOptions.title.text = (this.title) ? this.title.toUpperCase() : '';
    this.showChart = true;
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions);
    this.setFormatters();
    this.setEvents();


  }

  setEvents() {
    if (this.chart.id === 'recuentosFichaPuesto') {
      this.chartOptions.chart.events.click = (v, chart, options) => {

        if (options.dataPointIndex !== -1) {
          const cardPositionId = this.chart.data.id[options.dataPointIndex];
          const dialog = this.dialog.open(GridModalComponent, {
            width: '100vw',
            height: '100vh',
            data: {
              cardPositionId,
              dashboardId: this.dashboardId,
              chart: this.chart
            }
          });
        }
      };
    }
  }



  updateOptions(value) {
    this.setSeries(value);
    this.setCategories(value);
    this.chartOptions.series = [this.series];
    this.chartOptions.xaxis.categories = this.categories;
    this.chartOptions.title.text = (this.title) ? this.title.toUpperCase() : null;
    if (this.formatterColorOptions) this.formatColor();
    this.chartComponent.updateOptions(this.chartOptions);
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
    if (this.chart.barType === 'horizontal' || this.chart.barType === 'vertical') {
      this._series = {
        data,
        name: this.chart.title
      };
    } else if (this.chart.barType === 'negative') this._series = data.series;
  }

  setCategories(value) {
    this._categories = (value)
      ? this.chart.data[(typeof value === 'number')
        ? value + 'days'
        : value].categories
      : this.chart.data.categories;
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

  setFormatters() {
    if (this.chart.formatters && this.chart.formatters.length) {
      for (const formatter of this.chart.formatters) {
        this.setFormatterType(formatter);
      }
    }

    this.chartOptions.tooltip.x = {
      formatter: function (val) {
        return '';
      }
    };
  }

  setFormatterType(formatter) {
    switch (formatter.type) {
      case 'percent&negatives':
        switch (formatter.field) {
          case 'dataLabels':
            this.chartOptions.dataLabels = {
              ...this.chartOptions.dataLabels,
              formatter: function (val) {
                return val.toString().replace('-', '') + '%';
              }
            };
            break;
          case 'xaxis':
            this.chartOptions.xaxis.labels.formatter = function (val) {
              return val.toString().replace('-', '') + '%';
            };
            break;
          case 'yaxis':
            this.chartOptions.yaxis.labels.formatter = function (val) {
              return val.toString().replace('-', '') + '%';
            };
            break;
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
      case 'tooltipCustom':
        if (this.chart.formatters) {
          this.chartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
            return this.chart.formatters[0].custom
              .replace('|NAME|', this.categories[dataPointIndex])
              .replace('|GENDER|', (Array.isArray(this.series))
                ? this.series[seriesIndex].name
                : this.series.name)
              .replace('|TOTAL|', (Array.isArray(this.series))
                ? this.series[seriesIndex].data[dataPointIndex]
                : this.series.data[dataPointIndex]);
          };
        }
        break;
      default:
        break;
    }
  }

  setChartSize(beforeContentInit = false) {
    const innerWidth = this.innerWidth;
    if (innerWidth < 360) {
      this.chartOptions.chart.width = 80;
    } else if (innerWidth < 400 && innerWidth > 360) {
      this.chartOptions.chart.width = 100;
    } else if (innerWidth < 450 && innerWidth > 400) {
      this.chartOptions.chart.width = 150;
    } else if (innerWidth >= 450 && innerWidth < 575) {
      this.chartOptions.chart.width = 200;
    } else if (innerWidth >= 575 && innerWidth <= 767) {
      this.chartOptions.chart.width = 600;
    } else {
      this.chartOptions.chart.width = 300;
    }
    if (!beforeContentInit) this.chartComponent.updateOptions(this.chartOptions);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.responsive) this.setChartSize(false);
  }

}


