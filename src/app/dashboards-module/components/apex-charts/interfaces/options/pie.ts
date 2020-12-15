import {
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexChart,
    ApexFill,
    ApexTitleSubtitle,
    ApexDataLabels,
    ApexLegend
} from 'ng-apexcharts';

export interface PieChartOptions {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    title: ApexTitleSubtitle,
    responsive: ApexResponsive[];
    labels: any;
    fill: ApexFill;
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
}
