import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';

import { Router } from '@angular/router';
import { Position } from '../models/position.model';
import { Employee } from '../models/employee.model';
import { Competency } from '../models/competency.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  endpoint = environment.apiUrl + 'api';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private errorsService: ErrorsService) {
  }

  // Roles
  getAllRols() {
    return this.http.get<any>(`${this.endpoint}/roles`).pipe(catchError(this.errorsService.handleError));
  }

  deleteRol(id) {
    return this.http.delete<any>(`${this.endpoint}/roles/${id}`).pipe(catchError(this.errorsService.handleError));
  }

  createRol(name, description, permissions) {
    return this.http.post<any>(`${this.endpoint}/roles`, { name, description, permissions }).pipe(catchError(this.errorsService.handleError));
  }

  updateRol(id, name, description, permissions) {
    return this.http.put<any>(`${this.endpoint}/roles/${id}`, { name, description, permissions }).pipe(catchError(this.errorsService.handleError));
  }

  assignUserRols(userId: string, rols: string[]) {
    return this.http.post<any>(`${this.endpoint}/employees/assignRole`, { id: userId, roles: rols }).pipe(catchError(this.errorsService.handleError));
  }

  searchRoles(search: string) {
    return this.http.get<any>(`${this.endpoint}/roles/search/${search}/`);
  }


  // permisos
  getAllPermissions() {
    return this.http.get<any>(`${this.endpoint}/permissions`).pipe(catchError(this.errorsService.handleError));
  }


  // LOGIN

  getLoginCompanies() {
    return this.http.get<any>(`${this.endpoint}/companies`).pipe(catchError(this.errorsService.handleError));
  }


  register(data) {
    return this.http.post<any>(`${this.endpoint}/register`, data).pipe(catchError(this.errorsService.handleError));
  }
  login(data) {
    return this.http.post<any>(`${this.endpoint}/login`, data).pipe(catchError(this.errorsService.handleError));
  }

  // recuperar contraseña

  recoveryPassword(email) {
    return this.http.post<any>(`${this.endpoint}/employees/request-recovery-password`, email);
  }

  changePassword(data) {
    return this.http.put<any>(`${this.endpoint}/employees/change/password`, data);
  }

  changePasswordAfterRecoveryEmail(data) {
    return this.http.put<any>(`${this.endpoint}/employees/change/password-forgot`, data);
  }

  // employees
  getOneEmployee(id: string) {
    return this.http.get<any>(`${this.endpoint}/employees/${id}`);
  }

  addOneEmployee(employee: Employee) {
    return this.http.post<any>(`${this.endpoint}/employees`, employee);
  }

  deleteOneEmployee(employee: Employee) {
    return this.http.delete<any>(`${this.endpoint}/employees/${employee._id}`);
  }

  getAllEmployees(page?, rowsPerPage?, sort?: string, sortOrder?: number) {
    return this.http.get<any>(`${this.endpoint}/employees?page=${page}&rowsPerPage=${rowsPerPage}&sort=${sort}&sortOrder=${sortOrder}`);
  }

  getEmployeeList() {
    return this.http.get<any>(`${this.endpoint}/employees/getEmployeeList`);
  }

  getAvaliableManagers() {
    return this.http.get<any>(`${this.endpoint}/employees/managers`);
  }

  searchEmployee(search: string, page: number = 0, rowsPerPage: number = 10, sort?: string, sortOrder?: number) {
    return this.http.get<any>(`${this.endpoint}/employees/search/${search}?page=${page}&rowsPerPage=${rowsPerPage}&sort=${sort}&sortOrder=${sortOrder}`);
  }

  downloadExcelTemplate(): Observable<any> {
    return this.http.get<any[]>(`${this.endpoint}/employees/downloadExcelTemplate`, { responseType: 'blob' as 'json' }).pipe(catchError(this.errorsService.handleError));
  }

  uploadExcelTemplate(file): Observable<any> {
    return this.http.post<any[]>(`${this.endpoint}/employees/uploadExcelTemplate`, { file });
  }

  getEmployeesWithoutUnity(): Observable<any> {
    return this.http.get<any[]>(`${this.endpoint}/employees/no-unity`);
  }

  getEmployeeForUnities(id) {
    return this.http.get<any>(`${this.endpoint}/employees/unities/${id}`);
  }

  //#region positions
  getAvailablePositions() {
    return this.http.get<any>(`${this.endpoint}/positions/available`);
  }

  getAllPositions() {
    return this.http.get<any>(`${this.endpoint}/positions/all`);
  }

  getPosition(positionId: string) {
    return this.http.get<any>(`${this.endpoint}/positions/${positionId}`);
  }

  editUserInfo(id, data) {
    return this.http.put<any>(`${this.endpoint}/employees/${id}`, data);
  }

  modifyPersonalData(id, data) {
    return this.http.put<any>(`${this.endpoint}/personalData/${id}`, data);
  }

  getSchemaPersonalData() {
    return this.http.get(`${this.endpoint}/schemas?type=personal-data`);
  }

  addExtraPersonalData(data) {
    return this.http.put<any>(`${this.endpoint}/personalData/extra`, data);
  }

  extraPersonalDataCreated(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/personalData/extra`);
  }

  getPersonalData(id) {
    return this.http.get(`${this.endpoint}/personalData/${id}`);
  }

  //#endregion

  // #region cardPositions

  addCardPosition(data) {
    return this.http.post<any>(`${this.endpoint}/cardPositions/`, data);
  }

  editCardPosition(id, data) {
    return this.http.put<any>(`${this.endpoint}/cardPositions/${id}`, data);
  }

  printCardPosition(id) {
    const url = `${this.endpoint}/cardPositions/cardPositionToPdf/${id}`;
    const httpOptions = {
      'responseType': 'arraybuffer' as 'json'
      // 'responseType'  : 'blob' as 'json'
    };
    return this.http.get<any>(url, httpOptions);
  }

  getAllCardPositions(page?, rowsPerPage?, sort?: string, sortOrder?: number) {
    return this.http.get<any>(`${this.endpoint}/cardPositions?page=${page}&rowsPerPage=${rowsPerPage}&sort=${sort}&sortOrder=${sortOrder}`);
  }

  searchCardPositions(search: string, page: number = 0, rowsPerPage: number = 10, sort?: string, sortOrder?: number) {
    return this.http.get<any>(`${this.endpoint}/cardPositions/search/${search}?page=${page}&rowsPerPage=${rowsPerPage}&sort=${sort}&sortOrder=${sortOrder}`);
  }

  getAllDriverLicenses() {
    return this.http.get<any>(`${this.endpoint}/cardPositions/driverLicenses/distinct`);
  }
  getAllKpis() {
    return this.http.get<any>(`${this.endpoint}/cardPositions/kpis/distinct`);
  }
  getAllCardPositionsNames() {
    return this.http.get<any>(`${this.endpoint}/cardPositions/cardPositionsNames/distinct`);
  }

  getOneCardPosition(id: string) {
    return this.http.get<any>(`${this.endpoint}/cardPositions/${id}`);
  }

  getCardPositionByEmployee(employee: string) {
    return this.http.get<any>(`${this.endpoint}/employees/cardPositions/${employee}`);
  }


  getEmployeesByCardPosition(cadPositionId: string) {
    return this.http.get<any>(`${this.endpoint}/cardPositions/employees/${cadPositionId}`);
  }
  // #endregion

  getAllCompetences() {
    return this.http.get<any>(`${this.endpoint}/competences/`);
  }

  getOrgParents(id: any) {
    return this.http.get<any>(`${this.endpoint}/employees/getOrganizationChartParents/${id}`);
  }

  getOrgChart(id: any, idHighlight: any, type: string) {
    return this.http.get<any>(`${this.endpoint}/employees/orgChart/${type}/${id}/${idHighlight}`);
  }

  deleteCardPosition(cardId: string) {
    return this.http.delete<any>(`${this.endpoint}/cardPositions/${cardId}`);
  }

  uploadPhoto(file: File, employeeID: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name || 'foto.png');
    return this.http.put<any>(`${this.endpoint}/employees/${employeeID}/photo`, formData);
  }

  deletePhoto(employeeID: string): Observable<any> {
    return this.http.delete<any>(`${this.endpoint}/employees/${employeeID}/photo`);
  }

  getPhoto(employeeID: string) {
    return this.http.get<any>(`${this.endpoint}/employees/${employeeID}/photo`);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // this.currentUserSubject.next(null);
  }

  // #region Manager Team
  getManagerTeam() {
    return this.http.get<any>(`${this.endpoint}/employees/myTeam`);
  }
  // #endregion

  // competencies

  getCompetencies(): Observable<Object> {
    return this.http.get(`${this.endpoint}/competences`);
  }

  createCompetency(competency: Competency): Observable<Object> {
    return this.http.post(`${this.endpoint}/competences`, competency);
  }

  updateCompetency(id: string, competency: Competency): Observable<Object> {
    return this.http.put(`${this.endpoint}/competences/${id}`, competency);
  }

  deleteCompetency(id: string): Observable<Object> {
    return this.http.delete(`${this.endpoint}/competences/${id}`);
  }

  // positions

  getPositions(): Observable<Object> {
    return this.http.get(`${this.endpoint}/positions`);
  }

  createPosition(position: Position): Observable<Object> {
    return this.http.post(`${this.endpoint}/positions`, position);
  }

  updatePosition(id: string, position: Position): Observable<Object> {
    return this.http.put(`${this.endpoint}/positions/${id}`, position);
  }

  deletePosition(id: string): Observable<Object> {
    return this.http.delete(`${this.endpoint}/positions/${id}`);
  }

  // fichajes

  getCheckInOuts(page = 0, sort = 1, limit = 10, idEmployee?: string): Observable<Object> {
    const query = idEmployee ? `&employee=${idEmployee}` : '';
    return this.http.get(`${this.endpoint}/checkInOut?page=${page}&sort=${sort}&limit=${limit}${query}`);
  }

  getCheckInOutsLastStatus(): Observable<any> {
    return this.http.get(`${this.endpoint}/checkInOut/lastStatus`);
  }

  checkInOut(type, comments): Observable<Object> {
    return this.http.post(`${this.endpoint}/checkInOut`, { type: type, comments: comments }).pipe(catchError(this.errorsService.handleError));
  }

  getLastCheckInOut(): Observable<any> {
    return this.http.get(`${this.endpoint}/checkInOut/lastStatus`);
  }

  public getConfiguration() {
    const company = '5dd50a907cec954f1b39798a';
    return this.http.get<any>(`${this.endpoint}/configuration/${company}`);
  }

  public saveConfiguration(jsonConfig) {
    return this.http.put<any>(`${this.endpoint}/configuration/`, jsonConfig);
  }

  public unsubscribe() {
    return this.http.put<any>(`${this.endpoint}/configuration/unsubscribe`, {});
  }


  uploadPhotoCompany(file: File, folder): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name || 'foto.png');
    return this.http.put<any>(`${this.endpoint}/configuration/photo/${folder}`, formData);
  }

  uploadPhotoHome(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name || 'foto.png');
    return this.http.put<any>(`${this.endpoint}/configuration/photo/customHome/draft`, formData);
  }

  // positions

  getNotifications() {
    return this.http.get<any>(`${this.endpoint}/notifications`);
  }

  markAsReadedNotification(notificationId) {
    return this.http.put<any>(`${this.endpoint}/notifications/${notificationId}/read`, {});
  }

  deleteNotification(notificationId) {
    return this.http.delete<any>(`${this.endpoint}/notifications/${notificationId}`);
  }

  // translations

  getTranslation(folder: string, block: string, lang: string) {
    return this.http.get<any>(`${this.endpoint}/translations?folder=${folder}&block=${block}&lang=${lang}`);
  }

  getTranslationLoaderByDefault(folder: string, block: string, lang: string) {
    return this.http.get<any>(`${this.endpoint}/translations/${lang}?block=${block}&folder=${folder}`);
  }

  // surveys

  getPendingSurveys(lastLogin?: boolean) {
    return lastLogin && typeof lastLogin === 'boolean' ? this.http.get<any>(`${this.endpoint}/surveys/pending?lastLogin=true`) : this.http.get<any>(`${this.endpoint}/surveys/pending`);
  }

  addCustomSurveyResponses(responses: object) {
    return this.http.post<any>(`${this.endpoint}/customSurveyResponses`, responses);
  }

  // files
  uploadFile(file: File, customPath, visibillity?: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name || 'foto.png');
    return (visibillity === 'public' || !visibillity)
      ? this.http.post<any>(`${this.endpoint}/uploaderFiles/uploadMultipleFiles?path=${customPath}&privateFile=false`, formData)
      : this.http.post<any>(`${this.endpoint}/uploaderFiles/uploadMultipleFiles?path=${customPath}&privateFile=true`, formData);
  }

  downloadFile(idFile: string) {
    const httpOptions = {
      'responseType': 'arraybuffer' as 'json'
    };
    return this.http.put<any>(`${this.endpoint}/uploaderFiles/downloadFile/${idFile}`, {}, httpOptions);
  }

  changeFileVisibility(idOffer, urlFile, visibility) {
    return this.http.put(`${this.endpoint}/uploaderFiles/changeFileVisibility/${idOffer}`, { fileName: urlFile, visibility: visibility }, { responseType: 'blob' });
  }

  getAllFiles(page = 0, sort = 1, limit = 20, sortField = 'title', count: boolean = true, search: String = '') {
    return this.http.get<any>(`${this.endpoint}/uploaderFiles/?page=${page}&sort=${sort}&limit=${limit}&sortField=${sortField}&count=${count}&search=${search}`);
  }

  deleteFile(fileId) {
    return this.http.delete<any>(`${this.endpoint}/uploaderFiles/${fileId}`);
  }
}
