import { Component, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { Row, Col } from '../../../interfaces/dashboard';
import { Dashboard } from '../../../classes/dashboardCommon';

interface Size { width: number; heigth: number; }

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent extends Dashboard implements OnInit {

  @Input() series: any;
  @Input() title: string;
  @Input() row: Row;
  @Input() chart: Col;
  @Input() showCard = true;
  @Input() responsive: boolean;

  @ViewChild('chartComponent') chartComponent: ChartComponent;

  constructor() {
    super(Dashboard.getChartOptionsTemplate('pie'));
  }

  ngOnInit() {
    if (this.responsive) this.setChartSize(true);
    if (!this.series) this.series = this.row.cols[0].data.series;
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions)
    this.chartOptions.series = this.series.map((v: number) => Math.round(v * 10));
    this.chartOptions.title.text = this.title;
    this.chartOptions.tooltip.custom = (options) => {
      return this.chart.formatters[0].custom
        .replace('|NAME|', options.w.config.labels[options.seriesIndex])
        .replace('|TOTAL|', options.series[options.seriesIndex] / 10)
    };
    this.setFormatters();
  }


  setFormatters() {
    this.chartOptions.plotOptions.pie.donut.labels.value.formatter = (v) => (Number(v) / 10).toFixed();
    this.chartOptions.plotOptions.pie.donut.labels.total.formatter = (w) => {
      let total = 0;
      w.config.series.forEach((serie: number) => {
        total += serie / 10;
      });
      return total.toFixed();
    };
    this.chartOptions.tooltip.y = {
      formatter: (v) => (Number(v) / 10).toFixed()
    };

  }


  setChartSize(beforeContentInit = false) {
    const innerWidth = this.innerWidth;
    if (innerWidth < 360) {
      this.chartOptions.chart.width = 80;
    } else if (innerWidth < 400 && innerWidth > 360) {
      this.chartOptions.chart.width = 100;
    } else if (innerWidth < 450 && innerWidth > 400) {
      this.chartOptions.chart.width = 150;
    } else if (innerWidth >= 450 && innerWidth < 600) {
      this.chartOptions.chart.width = 200;
    } else if (innerWidth >= 600 && innerWidth < 800) {
      this.chartOptions.chart.width = 250;
    } else {
      this.chartOptions.chart.width = 280;
    }
    if (!beforeContentInit) this.chartComponent.updateOptions(this.chartOptions);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.responsive) this.setChartSize(true);
  }

}
