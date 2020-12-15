import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';

@Injectable()
export class DashboardApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        public errorsService: ErrorsService
    ) { }

    getAllSurveys() {
        return this.http.get<any>(`${this.endpoint}/surveys`);
    }

    getDashboardById(id: string, filters?) {
        return this.http.put<any>(`${this.endpoint}/dashboards/filterData/${id}`, filters);
    }

    getChartData(id: string, filters?, chartId?: string) {
        let url = `${this.endpoint}/dashboards/getChart/${id}`;
        if (chartId) url += `?chartId=${chartId}`;
        return this.http.put<any>(url, filters);
    }

    getPagination(id: string, chartId: string, page: number) {
        let params = new HttpParams();
        params = params
            .set('page', page.toString())

        return this.http.get<any>(`${this.endpoint}/dashboards/pagination/${id}/${chartId}`, { params });
    }

    getSearch(id: string, chartId: string, body: any, page = 0) {
        return this.http.put<any>(`${this.endpoint}/dashboards/search/${id}/${chartId}?page=${page}`, body);
    }

    getAllApexSurveys(type: string) {
        return this.http.get<any>(`${this.endpoint}/dashboards/${type}`);
    }


}
