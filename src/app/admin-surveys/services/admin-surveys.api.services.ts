import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';
import { Survey } from 'src/app/shared/models/survey.model';
import { CustomSurvey } from 'src/app/shared/models/custom-survey.model';

@Injectable()
export class AdminSurveysApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        private router: Router,
        // public logsService: LogsService,
        public errorsService: ErrorsService
    ) { }

    getSurvey(id: string) {
        return this.http.get<any>(`${this.endpoint}/surveys/${id}`);
    }

    getCustomSurvey(id: string) {
        return this.http.get<any>(`${this.endpoint}/customSurveys/${id}`);
    }

    getAllSurveys() {
        return this.http.get<any>(`${this.endpoint}/surveys`);
    }

    getAllCustomSurveys() {
        return this.http.get<any>(`${this.endpoint}/customSurveys`);
    }

    createSurvey(survey: Survey): Observable<Object> {
        return this.http.post(`${this.endpoint}/surveys`, survey);
    }

    createCustomSurvey(survey: CustomSurvey): Observable<Object> {
        return this.http.post(`${this.endpoint}/customSurveys`, survey);
    }

    updateSurvey(survey: Survey): Observable<Object> {
        return this.http.put(`${this.endpoint}/surveys`, survey);
    }

    updateCustomSurvey(survey: CustomSurvey): Observable<Object> {
        return this.http.put(`${this.endpoint}/customSurveys`, survey);
    }

    deleteSurvey(id: string): Observable<Object> {
        return this.http.delete(`${this.endpoint}/surveys/${id}`);
    }

    deleteCustomSurvey(id: string): Observable<Object> {
        return this.http.delete(`${this.endpoint}/customSurveys/${id}`);
    }

    getAllDashboardFilters() {
        return this.http.get<any>(`${this.endpoint}/dashboardFilters`);
    }
}
