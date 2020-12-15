import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ErrorsService } from 'src/app/shared/services/shared-services/errors.service';
import { Requirement } from '../interfaces/requirement';
import { Subscription, SearchParameters } from '../interfaces/subscription';
import { CustomDataSourceInterface } from '../interfaces/customdata';
import { Employee } from '../../shared/models/employee.model';
import { Notification } from '../../shared/models/notifications.interface';
const CONFIG_URL = environment.apiUrl + 'api';


@Injectable()
export class SelectionApiService {

    endpoint = environment.apiUrl + 'api';

    constructor(
        private http: HttpClient,
        public errorsService: ErrorsService
    ) { }

    /* OFFERS */

    addNewOffer(data, jsonAnnouncement?) {
        let query = '';
        if (Object.keys(jsonAnnouncement).length) {
            query = `?announcementId=${jsonAnnouncement['newAnnouncement']}&oldAnnouncementId=${jsonAnnouncement['oldAnnouncement']}`;
        }
        return this.http.post(`${CONFIG_URL}/offers${query}`, data);
    }

    getOffers({ search = '', page = 0, rowsPerPage = 10, sortField = 'startsAt', sortOrder = 1, count = true, idContainer = [] }: Partial<CustomDataSourceInterface>) {
        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField);

        let url = `${CONFIG_URL}/offers`;
        idContainer.forEach((offer, i) => {
            url += (i === 0) ? `?offers=${offer}` : `&offers=${offer}`
        })

        return this.http.get(url, { params });
    }

    getOffersByVisibility({
        search = 'title',
        page = 0,
        rowsPerPage = 10,
        sortField = 'startsAt',
        sortOrder = 1,
        count = true,
        idContainer = [],
        visibility = '',
        positionId = '' }: Partial<CustomDataSourceInterface>) {
        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('visibility', visibility)
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField)
            .set('positionId', positionId);

        let url = `${CONFIG_URL}/offers/byVisibility`;
        idContainer.forEach((offer, i) => {
            url += (i === 0) ? `?offers=${offer}` : `&offers=${offer}`;
        });
        return this.http.get(url, { params });
    }

    getPublicOffersByVisibility({ search = '', page = 0, rowsPerPage = 10, sort = '', sortOrder = 1, count = true, idContainer = [] }) {
        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sort);

        let url = `${CONFIG_URL}/offers/byVisibilityPublic`;
        idContainer.forEach((offer, i) => {
            url += (i === 0) ? `?offers=${offer}` : `&offers=${offer}`
        })
        return this.http.get(url, { params });
    }

    getFreeOffers(visibility: string = '') {
        let params = new HttpParams();
        params = params
            .set('visibility', visibility);

        return this.http.get(`${CONFIG_URL}/offers/freeOffers`, { params });
    }

    getOfferById(offerId) {
        return this.http.get(`${CONFIG_URL}/offers/${offerId}`);
    }

    saveOffer(offerId, jsonSend, jsonAnnouncement?) {
        let query = '';
        if (jsonAnnouncement && Object.keys(jsonAnnouncement).length) {
            query = `?announcementId=${jsonAnnouncement['newAnnouncement']}&oldAnnouncementId=${jsonAnnouncement['oldAnnouncement']}`;

        }
        return this.http.put(`${CONFIG_URL}/offers/${offerId}${query}`, jsonSend);
    }

    applyOffer(idOffer, state) {
        return this.http.put(`${CONFIG_URL}/candidatures/applyOffer/${idOffer}`, { state: state });
    }

    deApplyOffer(idOffer) {
        return this.http.put(`${CONFIG_URL}/candidatures/deApply/${idOffer}`, {});
    }

    linkToAnnouncement(idOffer, announcementId, oldAnnouncementId?) {
        const query = oldAnnouncementId ? `?oldAnnouncementId=${oldAnnouncementId}` : '';
        return this.http.put(`${CONFIG_URL}/offers/linkToAnnouncement/${idOffer}/${announcementId}${query}`, {});
    }

    downloadFile(urlFile, idOffer, folder, visibility) {
        return this.http.put(`${CONFIG_URL}/offers/downloadFile/${idOffer}/${folder}`, { fileName: urlFile, visibility: visibility }, { responseType: 'blob' });
    }

    changeFileVisibility(idOffer, folder, urlFile, visibility) {
        return this.http.put(`${CONFIG_URL}/offers/changeFileVisibility/${idOffer}/${folder}`, { fileName: urlFile, visibility: visibility }, { responseType: 'blob' });
    }

    /* ANNOUNCEMENTS */

    addNewAnnouncement(announcement) {
        return this.http.post(`${CONFIG_URL}/announcements`, announcement);
    }

    getAnnouncements({ search = '', page = 0, rowsPerPage = 10, sortField = 'startsAt', sortOrder = 1, count = true }: Partial<CustomDataSourceInterface>) {
        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField);

        return this.http.get(`${CONFIG_URL}/announcements`, { params });
    }

    getAnnouncementsByVisibility({
        search = 'title',
        page = 0,
        rowsPerPage = 10,
        sortField = 'startsAt',
        sortOrder = 1,
        count = true,
        visibility = '' }: Partial<CustomDataSourceInterface>) {

        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('visibility', visibility)
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField);

        return this.http.get(`${CONFIG_URL}/announcements/byVisibility`, { params });
    }

    getAnnouncementById(announcementId) {
        return this.http.get(`${CONFIG_URL}/announcements/${announcementId}`);
    }

    saveAnnouncement(announcementId, jsonSend) {
        return this.http.put(`${CONFIG_URL}/announcements/${announcementId}`, jsonSend);
    }

    getPublicAnnouncementsByVisibility(
        {
            search = '',
            page = 0,
            rowsPerPage = 10,
            sort = '',
            sortOrder = 1,
            count = true }: Partial<CustomDataSourceInterface>) {
        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sort);

        return this.http.get(`${CONFIG_URL}/announcements/byVisibilityPublic`, { params });
    }

    /* SUBSCRIPTIONS */

    getSubscriptions({
        search = '',
        page = 0,
        rowsPerPage = 10,
        sortField = '',
        sortOrder = 1,
        count = true }: Partial<CustomDataSourceInterface>) {
        let params = new HttpParams();

        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField);

        return this.http.get(`${CONFIG_URL}/subscriptions`, { params });
    }

    addSubscribtion(data: Partial<SearchParameters>) {
        return this.http.put<Subscription>(`${CONFIG_URL}/subscriptions`, data);
    }

    removeSubscribtion(subscriptionId: string) {
        return this.http.put<Subscription>(`${CONFIG_URL}/subscriptions/deSubscribe/${subscriptionId}`, {});
    }

    comunicateCandidates(offerId: string) {
        return this.http.put<Array<Employee>>(`${CONFIG_URL}/subscriptions/communicateSubscribers/${offerId}`, {});
    }

    /* CANDIDATURES */

    getCandidatures() {
        return this.http.get(`${CONFIG_URL}/candidatures`);
    }

    getRequirementsTitles(id: string) {
        return this.http.get(`${CONFIG_URL}/candidatures/requirementsTitles/${id}`);
    }

    getCandidaturesByEmployee(employee) {
        return this.http.get(`${CONFIG_URL}/candidatures/employee/${employee}`);
    }

    /* OTHER MERITS*/

    getOtherMerits() {
        return this.http.get<OtherMerits[]>(`${CONFIG_URL}/otherMerits`);
    }

    deleteMerits(merits: string[]) {
        let url = `${CONFIG_URL}/requirements/requirementMerit`;

        merits.forEach((m, i) => {
            url += (i === 0) ? `?merit=${m}` : `&merit=${m}`;
        });
        return this.http.delete(url);
    }

    /* FORMULAS*/
    getFormulas() {
        return this.http.get(`${CONFIG_URL}/formulas`);
    }

    getAllEmployeesCandidatures(page?, rowsPerPage?, sort?: number, sortField?: string, search?: string, offerId?: string) {
        let params = new HttpParams();
        params = params
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', 'true')
            .set('sort', sort.toString())
            .set('sortField', sortField);

        if (search) params = params.append('search', search)
        if (offerId) params = params.append('offerId', offerId)
        return this.http.get(`${CONFIG_URL}/candidatures/employees`, { params });
    }

    /* REQUIREMENTS */

    addRequirement(requirement) {
        return this.http.post(`${CONFIG_URL}/requirements`, requirement);
    }

    getRequirementById(id: string) {
        return this.http.get<Requirement>(`${CONFIG_URL}/requirements/${id}`);
    }

    getAllRequirements() {
        return this.http.get<Array<Requirement>>(`${CONFIG_URL}/requirements`);
    }

    getRequirements({
        search = '',
        page = 0,
        rowsPerPage = 10,
        sortField = '',
        sortOrder = 1,
        count = true
    }: Partial<CustomDataSourceInterface>) {

        let params = new HttpParams();
        params = params
            .set('search', search)
            .set('page', page.toString())
            .set('limit', rowsPerPage.toString())
            .set('count', count.toString())
            .set('sort', sortOrder.toString())
            .set('sortField', sortField);


        return this.http.get(`${CONFIG_URL}/requirements`, { params });
    }

    updateOneRequirement(id: string, body: Requirement) {
        return this.http.put<Requirement>(`${CONFIG_URL}/requirements/${id}`, body);
    }

    deleteOneRequirement(id: string) {
        return this.http.delete(`${CONFIG_URL}/requirements/${id}`);
    }

    /* REQUIREMENTS CRITERIA */

    getRequirementCriteria(requirementId) {
        return this.http.get(`${CONFIG_URL}/requirementCriteria/${requirementId}`);
    }

    deleteCriteria(criteria: string[]) {
        let url = `${CONFIG_URL}/requirements/requirementCriteria`;

        criteria.forEach((m, i) => {
            url += (i === 0) ? `?criteria=${m}` : `&criteria=${m}`;
        });
        return this.http.delete(url);
    }

    /* REQUIREMENTS COMBINATIONS */


    deleteCombinations(combinations: string[]) {
        let url = `${CONFIG_URL}/requirements/requirementCombinations`;

        combinations.forEach((m, i) => {
            url += (i === 0) ? `?combination=${m}` : `&combination=${m}`;
        });
        return this.http.delete(url);
    }

    getRequirementCombination(combinationId) {
        return this.http.get(`${CONFIG_URL}/requirementCombination/${combinationId}`);
    }

    getAllCombinations(blockId: string, formulaId: string) {
        interface Response { combination: Array<string> }
        return this.http.get<Response>(`${CONFIG_URL}/requirementCombination/allCombinations/${blockId}/${formulaId}`);
    }

    /* SCHEMAS */

    getOneBlock(type: string, blockId: string) {
        return this.http.get(`${CONFIG_URL}/schemas/oneBlock/${type}/${blockId}`);
    }

    getAllBlocks(type: string) {
        return this.http.get(`${CONFIG_URL}/schemas/allBlocks/${type}`);
    }

    getSchema() {
        return this.http.get(`${CONFIG_URL}/schemas?type=curriculum`);
    }

    /* CURRICULUM */

    getCurriculum(employee?) {
        const query = employee ? `?employee=${employee}` : '';
        return this.http.get(`${CONFIG_URL}/curriculums${query}`);
    }

    /* NOTIFICATIONS */


    getNotificationsUnreaded() {
        return this.http.get<Array<Notification>>(`${CONFIG_URL}/notifications/unread`);
    }

}
