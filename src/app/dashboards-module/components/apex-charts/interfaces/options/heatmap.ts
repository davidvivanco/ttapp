import {
    ApexAxisChartSeries,
    ApexTitleSubtitle,
    ApexDataLabels,
    ApexYAxis,
    ApexChart,
    ApexAnnotations
} from 'ng-apexcharts';

export interface HeatMapChartOptions {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    yaxis?: ApexYAxis;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    colors: any;
    annotations: ApexAnnotations;

}
