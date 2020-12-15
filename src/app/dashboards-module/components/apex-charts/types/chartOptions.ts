import { BarChartOptions } from '../interfaces/options/bar';
import { HeatMapChartOptions } from '../interfaces/options/heatmap';
import { PieChartOptions } from '../interfaces/options/pie';
import { RadiarBarChartOptions } from '../interfaces/options/radialbar';

export type ChartOptionsType = BarChartOptions & PieChartOptions & RadiarBarChartOptions & HeatMapChartOptions & { formatter: string };

