import { ChartType } from 'ng-apexcharts';
import { Chart } from '../interfaces/chart';
import { ChartOptionsType } from '../types/chartOptions';
import { HeatMapChartOptions } from '../interfaces/options/heatmap';
import { HostListener } from '@angular/core';

export class Dashboard implements Chart {

    public innerWidth: any;
    public chartOptions: Partial<ChartOptionsType>;
    public formatterColorOptions: any;
    public colorRange: Array<string>;
    constructor(chartOptions: any) {
        this.chartOptions = chartOptions as Partial<ChartOptionsType>;
        this.innerWidth = window.innerWidth;

    }

    static getChartOptionsTemplate<T>(type: ChartType): Partial<ChartOptionsType> {
        return {
            series: [],
            title: {
                text: ''
            },
            chart: {
                type,
                events: {},
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                        customIcons: []
                    },
                    export: {
                        csv: {
                            filename: undefined,
                            columnDelimiter: ',',
                            headerCategory: 'category',
                            headerValue: 'value',
                            dateFormatter(timestamp) {
                                return new Date(timestamp).toDateString()
                            }
                        }
                    },
                    autoSelected: 'zoom'
                },
            },
            dataLabels: {},
            legend: {
                show: false
            },
            tooltip: {},
            grid: {
                yaxis: {
                    lines: {
                        show: false,
                    }
                },
                show: false
            },
            plotOptions: {
                heatmap: {}
            },
            noData: {
                text: 'No hay datos disponibles para el filtro aplicado',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: undefined,
                    fontSize: '20px',
                    fontFamily: undefined
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ],
            xaxis: {
                labels: {}
            },
            yaxis: {
                labels: {}
            },
            fill: {
            }
        };

    }

    setDefaultOptions(defaultOptions) {
        if (defaultOptions.chart) this.chartOptions.chart = { ...this.chartOptions.chart, ...defaultOptions.chart };
        if (defaultOptions.title) {
            this.chartOptions.title = { ...this.chartOptions.title, ...defaultOptions.title };
            if (defaultOptions.title.text) this.chartOptions.title.text = defaultOptions.title.text.toUpperCase();
        }
        if (defaultOptions.colors) this.chartOptions.colors = defaultOptions.colors;
        if (defaultOptions.xaxis) this.chartOptions.xaxis = { ...this.chartOptions.xaxis, ...defaultOptions.xaxis };
        if (defaultOptions.yaxis) this.chartOptions.yaxis = { ...this.chartOptions.yaxis, ...defaultOptions.yaxis };
        if (defaultOptions.tooltip) this.chartOptions.tooltip = { ...this.chartOptions.tooltip, ...defaultOptions.tooltip };
        if (defaultOptions.stroke) this.chartOptions.stroke = { ...this.chartOptions.stroke, ...defaultOptions.stroke };
        if (defaultOptions.legend) this.chartOptions.legend = { ...this.chartOptions.legend, ...defaultOptions.legend };
        if (defaultOptions.responsive) this.chartOptions.responsive = defaultOptions.responsive;
        if (defaultOptions.labels) this.chartOptions.labels = defaultOptions.labels;
        if (defaultOptions.fill) this.chartOptions.fill = { ...this.chartOptions.fill, ...defaultOptions.fill };
        if (defaultOptions.dataLabels) this.chartOptions.dataLabels = { ...this.chartOptions.dataLabels, ...defaultOptions.dataLabels };
        if (defaultOptions.plotOptions) this.chartOptions.plotOptions = { ...this.chartOptions.plotOptions, ...defaultOptions.plotOptions };
        if (defaultOptions.formatterColorOptions) {
            this.formatterColorOptions = defaultOptions.formatterColorOptions;
            this.colorRange = this.formatterColorOptions.colorRange;
            this.formatColor();
        }
    }


    formatColor() {
        switch (this.chartOptions.chart.type) {
            case 'bar':
                this.chartOptions.colors = this.formatBarChartColor();
                break;
            case 'radialBar':
                this.chartOptions.fill.colors = this.formatRadialBarChartColor();
                break;
            case 'heatmap':
                this.chartOptions.plotOptions.heatmap.colorScale = {
                    ranges: this.formatHeatMapChartColor()
                };
                break;

            default:
                break;
        }

    }


    formatBarChartColor(): Array<string> {
        const colors = [];

        const series = this.chartOptions.series[0] as any;
        for (let serie of series.data) {
            serie = Math.round(serie);
            const index = (serie > this.colorRange.length) ? this.colorRange.length - 1 : serie;
            colors.push(this.colorRange[index - 1]);
        }
        return colors;
    }

    formatRadialBarChartColor(): Array<string> {
        const colors = [];
        const serie = Math.round(this.chartOptions.series[0] / 10);
        const index = (serie > this.colorRange.length) ? this.colorRange.length - 1 : serie;
        colors.push(this.colorRange[index]);

        return colors;
    }

    formatHeatMapChartColor() {
        return this.colorRange as any;
    }



}
