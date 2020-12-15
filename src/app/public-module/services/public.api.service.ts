import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';

import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';
import { PublicRegister } from 'src/app/shared/models/public-register.interface';

@Injectable()
export class PublicApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        public errorsService: ErrorsService

    ) { }

    registerUser(data: PublicRegister) {
        return this.http.post<any>(`${this.endpoint}/employees/register`, data).pipe(catchError(this.errorsService.handleError));
    }

    linkedinAccess(data: { userProviderCode: string }) {
        return this.http.post<any>(`${this.endpoint}/employees/linkedinAccess`, data).pipe(catchError(this.errorsService.handleError));
    }

    providerAccess(user: any) {
        return this.http.post<any>(`${this.endpoint}/employees/providerAccess`, user).pipe(catchError(this.errorsService.handleError));
    }


}
