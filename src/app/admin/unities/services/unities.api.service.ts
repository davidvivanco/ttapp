import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';
import { Unity } from 'src/app/shared/models/unity.model';

@Injectable({
  providedIn: 'root'
})
export class UnitiesApiService {

  endpoint = environment.apiUrl + 'api';

  constructor(
    private http: HttpClient,
    private router: Router,
    // public logsService: LogsService,
    public errorsService: ErrorsService
  ) { }

  getUnity(id: string) {
    return this.http.get<any>(`${this.endpoint}/unity/${id}`);
  }

  getAllUnities() {
    return this.http.get<any>(`${this.endpoint}/unity`);
  }

  createUnity(unity: Unity): Observable<Object> {
    return this.http.post(`${this.endpoint}/unity`, unity);
  }

  updateUnity(id: string, unity: Unity): Observable<Object> {
    return this.http.put(`${this.endpoint}/unity/${id}`, unity);
  }

  deleteUnity(id: string): Observable<Object> {
    return this.http.delete(`${this.endpoint}/unity/${id}`);
  }

  getWithoutParent(id?: string){
    return this.http.get<any>(`${this.endpoint}/unity/no-parent/${id}`);
  }

  getNewWithoutParent(id?: string){
    return this.http.get<any>(`${this.endpoint}/unity/no-parent`);
  }

}
