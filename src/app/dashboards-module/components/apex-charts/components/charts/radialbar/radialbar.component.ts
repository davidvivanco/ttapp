import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { RadiarBarChartOptions } from '../../../interfaces/options/radialbar';
import { Chart } from '../../../interfaces/chart';
import { ChartComponent } from 'ng-apexcharts';
import { Row, Col } from '../../../interfaces/dashboard';
import { Dashboard } from '../../../classes/dashboardCommon';

@Component({
  selector: 'app-radialbar',
  templateUrl: './radialbar.component.html'
})
export class RadialbarComponent extends Dashboard implements OnInit, Chart {

  @Input() responsive: boolean;
  @Input() series: any;
  @Input() title: string;
  @Input() row: Row;
  chart: Col;
  @ViewChild('chartComponent') chartComponent: ChartComponent;

  constructor() {
    super(Dashboard.getChartOptionsTemplate('radialBar'));

  }

  ngOnInit() {
    this.responsive = true;
    if (!this.series) this.series = this.row.cols[0].data.series;
    this.chart = this.row.cols[0];
    this.chartOptions.series = this.series.map((v: number) => Math.round(v * 10));
    this.chartOptions.title.text = this.title;
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions);

  }


  updateOptions(index) {
    this.series = this.row.cols[index].data.series;
    this.chart = this.row.cols[index];
    this.chartOptions.series = this.series.map((v: number) => Math.round(v * 10));
    this.chartOptions.title.text = this.title;
    if (this.chart.chartOptions) {
      this.setDefaultOptions(this.chart.chartOptions);
      if (this.innerWidth < 767) {
        this.chart.chartOptions.chart.offsetY = -20;
        this.chart.chartOptions.chart.offsetX = 125;
        this.chart.chartOptions.chart.width = 350;
        this.chart.chartOptions.chart.height = 500;
      } else {
        this.chartOptions.chart.offsetY = -20;
        this.chartOptions.chart.offsetX = 35;
        this.chartOptions.chart.width = 280;
        this.chartOptions.chart.height = 420;
      }
    }
    this.chartComponent.updateOptions(this.chartOptions);
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
      this.chartOptions.chart.offsetY = -20;
      this.chartOptions.chart.offsetX = 125;
      this.chartOptions.chart.width = 350;
      this.chartOptions.chart.height = 500;
    } else {
      this.chartOptions.chart.offsetY = -20;
      this.chartOptions.chart.offsetX = 35;
      this.chartOptions.chart.width = 280;
      this.chartOptions.chart.height = 420;
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

