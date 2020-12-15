import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';

@Injectable()
export class CheckinoutApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        private router: Router,
        // public logsService: LogsService,
        public errorsService: ErrorsService
    ) { }

    getCheckInOuts(page = 0, sort = 1, limit = 10, idEmployee?: string): Observable<Object> {
        const query = idEmployee ? `&employee=${idEmployee}` : '';
        return this.http.get(`${this.endpoint}/checkInOut?page=${page}&sort=${sort}&limit=${limit}${query}`);
    }

    checkInOut(type, comments): Observable<Object> {
        return this.http.post(`${this.endpoint}/checkInOut`, { type: type, comments: comments }).pipe(catchError(this.errorsService.handleError));
    }

    // #region Manager Team
    getManagerTeam() {
        return this.http.get<any>(`${this.endpoint}/employees/myTeam`);
    }

}
