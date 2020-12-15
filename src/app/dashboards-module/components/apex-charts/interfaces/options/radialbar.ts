import {
    ApexNonAxisChartSeries,
    ApexPlotOptions,
    ApexChart,
    ApexFill,
    ApexTitleSubtitle,
    ApexResponsive
} from 'ng-apexcharts';

export interface RadiarBarChartOptions {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels?: string[];
    title: ApexTitleSubtitle;
    responsive: ApexResponsive[];
    plotOptions: ApexPlotOptions;
    fill: ApexFill;
}
