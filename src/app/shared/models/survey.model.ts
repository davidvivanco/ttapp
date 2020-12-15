import { Periodicity } from './periodicity.model';
import { DashboardFilter } from './dashboard-filter.model';
import { CommonFunctions } from 'src/app/commonFunctions';

export class Survey {
    _id?: string;
    title: string;
    desc: string;
    dashboard: Dashboard;
    typeformUrl: string;
    periodicity: Periodicity;
    finishDate: Date;
    startDate: Date;
    type: string;
    state: string; // published, incomplete
    surveyType: string;

    constructor(survey?) {
        const container = {
            title: '',
            desc: '',
            dashboard: { rows: [], selects: [] },
            periodicity: { type: 'hours', value: 24 },
            finishDate: '',
            startDate: '',
            type: '',
            state: 'incomplete'
        };
        new CommonFunctions().assignsVars(this, container, survey);
    }
}

export interface Dashboard {
    rows: Array<Row>,
    selects: Array<DashboardFilter>
}

export interface Row {
    _id?: string,
    name: string,
    cols: Array<Col>,
}

export interface Col {
    _id?: string,
    name: string,
    class: string,
    select: Array<string>,
    filter?: Array<DashboardFilter>,
    mongoChartUrl: any,
    size: string,
    height: number
}

export interface Surveys {
    pendingSurveys: Array<Survey>,
    status: number
}

export interface TypeformOptions {
    mode?: string,
    autoOpen?: boolean,
    autoClose?: number,
    hideScrollbars?: boolean,
    onSubmit?: Function
}