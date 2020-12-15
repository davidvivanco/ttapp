import { DashboardApex } from './dashboard';

export interface Dashboards {
    _id: string;
    api: Api;
    dashboard: DashboardApex;
    name: string;
    desc: string;
    startDate: Date;
    finishDate: Date;
    type: string;
}

