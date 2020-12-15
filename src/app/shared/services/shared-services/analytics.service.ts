import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';


@Injectable()
export class AnalyticsService {

    url = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        private errorsService: ErrorsService
        ) {
    }

    addAnalytics(data): Observable<any> {
        return this.http.post<any>(this.url + '/analytics', data).pipe(catchError(this.errorsService.handleError));
    }

}
