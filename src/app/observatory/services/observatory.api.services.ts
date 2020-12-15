import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';

@Injectable()
export class ObservatoryApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        private router: Router,
        // public logsService: LogsService,
        public errorsService: ErrorsService
    ) { }

    loginBlog(email, password): Observable<Object> {
        return this.http.post(`https://blog.kolete.es/api/v1/login`, { email, password }).pipe();
    }

    registerBlog(email, password): Observable<Object> {
        return this.http.post(`https://blog.kolete.es/api/v1/register`, {
            email, password,
            company: 'TalentTools', rol: 'registro'
        }).pipe();
    }

    login(email, password): Observable<Object> {
        return this.http.post(`https://app-kolete.appspot.com/api/user/login`, { email, password }).pipe();
    }

    register(email, password): Observable<Object> {
        return this.http.post(`https://app-kolete.appspot.com/api/user/auto-register-user`, { email, password }).pipe();
    }
}
