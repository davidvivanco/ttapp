import {
    ApexStroke,
    ApexTooltip,
    ApexFill,
    ApexChart,
    ApexXAxis,
    ApexAxisChartSeries,
    ApexDataLabels,
    ApexPlotOptions,
    ApexTitleSubtitle,
    ApexYAxis,
    ApexLegend,
    ApexGrid,
    ApexResponsive,
    ApexAnnotations,
    ApexNoData,
} from 'ng-apexcharts';


export interface BarChartOptions {
    series?: ApexAxisChartSeries;
    chart?: ApexChart;
    noData?: ApexNoData;
    dataLabels?: ApexDataLabels;
    responsive: ApexResponsive[];
    plotOptions?: ApexPlotOptions;
    yaxis?: ApexYAxis;
    xaxis?: ApexXAxis;
    grid?: ApexGrid;
    annotations: ApexAnnotations;
    colors?: string[];
    stroke?: ApexStroke;
    title?: ApexTitleSubtitle;
    tooltip?: ApexTooltip;
    fill?: ApexFill;
    legend?: ApexLegend;
}
