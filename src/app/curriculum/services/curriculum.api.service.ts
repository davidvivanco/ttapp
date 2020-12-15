import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Block } from '../classes/block';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, tap, concatMap } from 'rxjs/operators';


const CONFIG_URL = environment.apiUrl + 'api';
@Injectable()
export class CurriculumApiService {

  constructor(private http: HttpClient) { }

  getBlocks(versionName?: string): Observable<any> {
    const url = `${CONFIG_URL}/schemas?type=curriculum`;
    return this.http.get(url).pipe(
      map((data: any) => {
        let blocks = [];
        const hasVersions = data.versions && data.versions.length > 0;

        if (versionName === 'last' && hasVersions) {
          const version = data.versions.pop();
          blocks = version.blocks.map(block => new Block(block));
        } else {
          blocks = data.blocks.map(block => new Block(block));
        }

        return blocks;
      })
    );
  }


  getBlocksPublished(): Observable<any> {
    const url = `${CONFIG_URL}/schemas/lastVersion?type=curriculum`;
    return this.http.get(url);
  }

  getSchema() {
    return this.http.get(`${CONFIG_URL}/schemas?type=curriculum`);
  }

  getBlock(id: string): Observable<any> {
    const url = `${CONFIG_URL}/schemas?type=curriculum`;
    return this.http.get(url).pipe(
      map((data: any) => {
        const block = data.blocks.find(item => item._id === id);

        if (!block) {
          throw new Error('Not found block');
        }

        return new Block(block);
      })
    );
  }

  getBlockPublished(id: string): Observable<any> {
    const url = `${CONFIG_URL}/schemas/lastVersion?type=curriculum`;
    return this.http.get(url).pipe(
      map((data: any) => {
        const block = data.blocks.find(item => item._id === id);

        if (!block) {
          throw new Error('Not found block');
        }

        return new Block(block);
      })
    );
  }

  createBlock(data) {
    const { _id, ...rqData } = new Block(data);

    return this.updateStatus('draft').pipe(
      concatMap(() => this.http.post(`${CONFIG_URL}/schemas/block?type=curriculum`, rqData))
    );
  }

  updateBlock(block: Block) {
    block.fields.forEach((field: any, i) => {
      field.order = i;
    });

    return this.updateStatus('draft').pipe(
      tap(() => this.http.put(`${CONFIG_URL}/schemas/${block._id}?type=curriculum`, block).subscribe(() => { }))
    );
  }

  updateStatus(status: string) {
    return this.http.put(`${CONFIG_URL}/schemas/status?type=curriculum`, { status });
  }

  publish() {
    return this.updateStatus('active').pipe(
      tap(() => this.http.put(`${CONFIG_URL}/schemas/publish?type=curriculum`, { version: Date.now() }).subscribe(() => { }))
    );
  }

  deleteBlock(block: Block | string) {
    const id = block instanceof Block ? block._id : block;

    return this.http.delete(`${CONFIG_URL}/schemas/${id}?type=curriculum`);
  }


  deleteValueBlock(block: string, employeeId?) {
    let query = '';
    if (employeeId !== null) {
      query = `?employee=${employeeId}`;
    }
    return this.http.delete(`${CONFIG_URL}/curriculums/${block}${query}`);
  }

  getCurriculum(employee?) {
    const query = employee ? `?employee=${employee}` : '';
    return this.http.get(`${CONFIG_URL}/curriculums${query}`);
  }

  updateCurriculum(block, employeeId?) {
    let query = '';
    if (employeeId !== null) {
      query = `?employee=${employeeId}`;
    }
    return this.http.post(`${CONFIG_URL}/curriculums${query}`, { block });
  }

  updateCurriculumPublished(block, employeeId?) {
    let query = '';
    if (employeeId !== null) {
      query = `?employee=${employeeId}`;
    }
    return this.http.put(`${CONFIG_URL}/curriculums${query}`, { block });
  }

  getTreeExcelTemplate(blockId?: string, fieldId?: string) {
    let url = `${CONFIG_URL}/schemas/downloadTreeExcel?type=curriculum`
    if (blockId && fieldId) url = url + `&blockId=${blockId}&fieldId=${fieldId}`
    return this.http.get(url, { responseType: 'blob' as 'json' });
  }

  getOneEmployee(id: string) {
    return this.http.get<any>(`${CONFIG_URL}/employees/${id}`);
  }

  createPdfTemplate(id: string, data) {
    return this.http.post<any>(`https://talentsolutions.rrhh.cloud/api/client/${id}/templates`, data);
  }

  generatePdf(id: string, templateId: string, data) {
    const httpOptions = {
      'responseType': 'arraybuffer' as 'json'
    };
    return this.http.post<any>(`https://talentsolutions.rrhh.cloud/api/client/${id}/templates/${templateId}/pdf`, data, httpOptions);
  }

  getCvTemplate(id: string) {
    const httpOptions = {
      'responseType': 'html' as 'json'
    };
    return this.http.get<any>(`${CONFIG_URL}/curriculums/cvToPdf/${id}`, httpOptions);
  }
}
