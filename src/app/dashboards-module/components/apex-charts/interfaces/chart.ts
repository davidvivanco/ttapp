import { RadiarBarChartOptions } from './options/radialbar';
import { HeatMapChartOptions } from './options/heatmap';

export interface Chart {
    chartOptions: Partial<RadiarBarChartOptions> | Partial<HeatMapChartOptions>;
    // chartComponent: ChartComponent;
}
