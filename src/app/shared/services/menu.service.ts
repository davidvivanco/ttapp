import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ErrorsService } from './shared-services/errors.service';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  endpoint = environment.apiUrl + 'api';

  constructor(
    private http: HttpClient,
    private errorsService: ErrorsService
  ) { }

  getMenus() {
    return this.http.get<any[]>(`${this.endpoint}/menu`);
  }

  getMenu(id) {
    return this.http.get<any[]>(`${this.endpoint}/menu/${id}`);
  }

  updateAll(data) {
    return this.http.put<any>(`${this.endpoint}/menu/`, data).pipe(catchError(this.errorsService.handleError));
  }

  getPages() {
    return this.http.get<any[]>(`${this.endpoint}/pages`);
  }

  updateOne(id, data) {
    return this.http.put<any>(`${this.endpoint}/menu/${id}`, data).pipe(catchError(this.errorsService.handleError));
  }

  deleteOne(id) {
    return this.http.delete<any>(`${this.endpoint}/menu/${id}`).pipe(catchError(this.errorsService.handleError));
  }
}
