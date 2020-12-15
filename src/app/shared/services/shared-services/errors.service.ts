import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

import { Router } from '@angular/router';

@Injectable()
export class ErrorsService {
    endpoint = environment.apiUrl + 'api';

    constructor(
        private router: Router,
        public logsService: LogsService,) {
    }

    handleError = (err: any) => {
        if (err.status === 0) {
            this.logsService.logError('No hay conexión con el servidor');
            return throwError('Sin conexión');
        }
        if (err.status === 401) { // El token ha expirado y se debe volver a hacer login
            this.router.navigate(['/public/login']);
        }
        const errMsg = (err.error.message) ? err.error.message : JSON.stringify(err.error);
        if (!(err.status === 418 || err.status === 404)) {
            this.logsService.logError(errMsg);
        }
        return throwError(err);
    };

}