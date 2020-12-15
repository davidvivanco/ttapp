import { ChartOptionsType } from '../types/chartOptions';

export interface DashboardApex {
    globalFilter: GlobalFilter;
    rows: Row[];
}

export interface Row {
    _id: string;
    type?: string;
    toogle?: Toggle;
    select?: Select;
    slider?: Slider;
    cols: Col[];
}

interface Toggle {
    type: string;
    labels: Array<string> & Array<{ label: string, value: string }>
}

interface GlobalFilter {
    filters: Array<{
        id: string
        label: string
        name: string
        options: Array<{ name: string, value: string }>
    }>;
}

interface Select {
    defaultValue: string;
    labels: Array<string> & Array<{ label: string, value: string }>;
}

interface Slider {
    sliderOptions: SliderOptions;
}

interface SliderOptions {
    min: number;
    max: number;
    step: number;
    value: number;
}


export interface Col {
    title: string;
    formatters?: any[];
    defaultValue: string;
    chartType: string;
    barType: string;
    chartOptions: Partial<ChartOptionsType>;
    id: string;
    class: string;
    select?: Select;
    slider?: Slider;
    toggle?: Toggle;
    data?: any;
}


