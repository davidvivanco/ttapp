import { Injectable } from '@angular/core';
import { Audits } from './../models/audits.model';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditsService {
  endpoint = environment.apiUrl + 'api';
  constructor(private http: HttpClient) { }
  getAudits(search: string = '', page: number = 0, limit: number = 10, sortField: string = '' , sortOrder: number = 1, count: boolean = true): Observable<Audits[]> {
    return this.http.get<Audits[]>(`${this.endpoint}/audits?search=${search}&page=${page}&limit=${limit}&count=${count}&sort=${sortOrder}&sortField=${sortField}`);
  }
}
