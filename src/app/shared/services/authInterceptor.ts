import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Headers } from 'ng2-file-upload';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';
import { LogsService } from './shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from '../models/logsMessages.interface';

const secret = ']q;]nlKWTjdw)P1L4@ph?TCgtF&Ml{dOc#_bX~Vp7b,\'1/B4E>:hRGL;r!i*@+3';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private logsMessagesTranslations: LogsMessagesCommon;

  static getRequestHeaders(userToken): Headers[] {
    return [
      { name: 'x-access-token', value: userToken } as Headers,
      { name: 'x-secret', value: secret } as Headers,
      { name: 'cache-control', value: 'no-cache' } as Headers,
      { name: 'pragma', value: 'no-cache' } as Headers,
    ];
  }



  constructor(
    private userService: UserService,
    private logsService: LogsService,
    private translateService: TranslateService
  ) {
  }

  getLogsTranslations() {
    return this.translateService.get([
      'logsMessages.common.demoError']);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = { 'x-access-token': this.userService.getToken() || '' };
    let handle: unknown;
    if (req.url.includes('photo')) handle = req.clone({ setHeaders: { ...token, 'x-secret': secret, 'cache-control': 'no-cache', 'pragma': 'no-cache' } });
    else if (req.url.includes('kolete')) handle = req.clone({ setHeaders: { 'cache-control': 'no-cache', 'pragma': 'no-cache' } });
    else handle = req.clone({ setHeaders: { ...token, 'x-secret': secret, 'cache-control': 'no-cache', 'pragma': 'no-cache', 'Content-Type': 'application/json' } });

    return next.handle(handle as any).pipe(
      catchError(error => {
        this.handleError(error);
        return throwError(error);
      }));

  }

  handleError(error: HttpErrorResponse) {
    this.getLogsTranslations().subscribe((translations) => {
      this.logsMessagesTranslations = translations;
      switch (error.error.message) {
        case 'X001':
          this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.demoError']);
          break;
        default:
          break;
      }
    });
  }
}

