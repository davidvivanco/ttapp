import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap, concatMap } from 'rxjs/operators';


const CONFIG_URL = environment.apiUrl + 'api';
@Injectable()
export class AdminPersonalDataApiService {

  constructor(private http: HttpClient) { }



  createBlockPersonalData(data) {
    return this.updateStatus('draft').pipe(
      concatMap(() => this.http.post(`${CONFIG_URL}/schemas/block?type=personal-data`, data))
    );
  }

  editBlockPersonalData(data, id) {
    return this.updateStatus('draft').pipe(
      concatMap(() => this.http.put(`${CONFIG_URL}/schemas/${id}?type=personal-data`, data))
    );
  }

  getBlocksPublished(): Observable<any> {
    const url = `${CONFIG_URL}/schemas/lastVersion?type=personal-data`;
    return this.http.get(url);
  }

  getSchema() {
    return this.http.get(`${CONFIG_URL}/schemas?type=personal-data`);
  }

  createSchema() {
    return this.http.post(`${CONFIG_URL}/schemas`, { type: 'personal-data' });
  }

  updateStatus(status: string) {
    return this.http.put(`${CONFIG_URL}/schemas/status?type=personal-data`, { status });
  }

  updateDataCollectionActivated(dataCollectionActivated: boolean) {
    return this.http.put(`${CONFIG_URL}/schemas/dataCollectionActivated?type=personal-data`, { dataCollectionActivated });
  }


  publish() {
    return this.updateStatus('active').pipe(
      tap(() => this.http.put(`${CONFIG_URL}/schemas/publish?type=personal-data`, { version: Date.now() }).subscribe(() => { }))
    );
  }

  deleteField(element, blockId) {
    return this.http.delete(`${CONFIG_URL}/schemas/${blockId}/${element._id}/personal-data`);
  }


}
