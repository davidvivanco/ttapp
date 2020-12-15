import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SelectionApiService } from '../../services/selection.api.services';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { State, filterBy, groupBy } from '@progress/kendo-data-query';
import { process } from '@progress/kendo-data-query';
import { Employee } from '../../../shared/models/employee.model';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-candidates',
  templateUrl: './admin-candidates.component.html'
})

@Injectable()
export class AdminCandidatesComponent implements OnInit {
  globalFilter = new FormControl('');
  breadcrumbList = 'Talentoo';
  loading: boolean;
  gridView: any;
  totalCandidates = 0;
  listCandidates = [];
  offerId: string;
  pageSize = 5;
  page = 0;
  search: string;
  filter: any;
  group: any;

  state: State = {
    skip: 0,
    take: 5,
  };

  //Variables que controlan la vista
  EmployeeForDataPersonal: Employee;
  EmployeeForCV: Employee;
  EmployeeForOffers: Employee;
  userSelected: string = null

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;

  constructor(
    private api: SelectionApiService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute) {
    this.offerId = null;
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.search = str ? str : null;
          this.resetCandidatesLoaded();
          this.getCandidates();
        }
      );

    this.route.queryParams.subscribe(parmas => {
      const extras = this.router.getCurrentNavigation().extras.state;
      if (extras && extras.employee) {
        switch (extras.navigateTo) {
          case 'personalData':
            this.seePersonalData(extras.employee);
            break;
          case 'curriculum':
            this.seeCurriculum(extras.employee);
            break;
          case 'candidatures':
            this.seeCandidatures(extras.employee);
            break;
          default:
            break;
        }
        this.goBack = () => {
          this.router.navigate(['/cuadro-mandos/global'])
        }
      }
      this.offerId = (parmas.offerId) ? parmas.offerId : null;
      this.getCandidates();
    })

  }

  ngOnInit() {

    this.logsMessagesKeys = [
      'genericMessages.announcements',
      'genericMessages.personalData',
      'genericMessages.curriculum',
      'genericMessages.candidatures',
      'genericMessages.candidate',
      'genericMessages.candidates'
    ];
    this.getLogsTranslations();
  }
  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
        this.breadcrumbString();
      });
  }

  breadcrumbString() {
    this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.announcements']);
    if (!this.EmployeeForDataPersonal && !this.EmployeeForCV && !this.EmployeeForOffers) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.candidates']);
    }
    if (this.EmployeeForDataPersonal || this.EmployeeForCV || this.EmployeeForOffers) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.candidate']);
    }
    if (this.EmployeeForDataPersonal) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.personalData']);
    }
    if (this.EmployeeForCV) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.curriculum']);
    }
    if (this.EmployeeForOffers) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.candidatures']);
    }
  }

  getCandidates(page = 0, limit = this.state.take, sort = 1, sortField = 'personalData.name', search = this.search) {
    this.showLoading();
    this.api.getAllEmployeesCandidatures(page, limit, sort, sortField, search, this.offerId).subscribe((employees: { total: number, pagination: Array<Employee> }) => {
      if (search) this.resetCandidatesLoaded();
      this.totalCandidates = employees.total;
      this.loadCandidates(employees);
      this.setGridViewData();
    });
  }


  goBack() {
    this.EmployeeForDataPersonal = null;
    this.EmployeeForCV = null;
    this.EmployeeForOffers = null;
    this.userSelected = null;
  }

  seePersonalData(element) {
    this.EmployeeForDataPersonal = element;
    this.EmployeeForCV = null;
    this.EmployeeForOffers = null;
  }

  seeCurriculum(element) {
    this.EmployeeForCV = element;
    this.EmployeeForDataPersonal = null;
    this.EmployeeForOffers = null;
  }

  seeCandidatures(element) {
    this.EmployeeForOffers = element;
    this.EmployeeForCV = null;
    this.EmployeeForDataPersonal = null;
  }

  groupChange(group) {
    if (this.thereIsNoGroup(group)) this.getCandidates(this.page);

    this.group = group;
    this.gridView = groupBy(this.listCandidates, group);
    this.gridView.total = this.totalCandidates;
  }


  filterChange(filter: any) {
    if (this.thereIsNofilter(filter)) this.getCandidates(this.page);

    this.filter = filter;
    this.gridView = filterBy(this.listCandidates, filter);
    this.gridView.total = this.totalCandidates
  }

  pageChange(state: PageChangeEvent) {
    this.state.skip = state.skip;
    const totalEmployeesLoaded = this.listCandidates.length;

    if (this.employeesAreAlreadyLoaded(totalEmployeesLoaded, this.state.skip)) {
      this.setGridViewData();
      return;
    } else this.loadNewEmployees(totalEmployeesLoaded, state);
  }

  loadNewEmployees(totalEmployeesLoaded, state: PageChangeEvent) {
    const lastPageLoaded = totalEmployeesLoaded / state.take;
    const whatPageLoad = state.skip / state.take;
    this.getAllPagesRequired(lastPageLoaded, whatPageLoad)
  }

  getAllPagesRequired(lastPageLoaded, whatPageLoad) {
    const promises = [];

    for (let page = lastPageLoaded; page <= whatPageLoad; page++) {
      promises.push(this.api.getAllEmployeesCandidatures(page, this.state.take, 1, 'personalData.name', this.search))
    }

    forkJoin(promises).subscribe(res => {
      res.forEach((e: any) => this.listCandidates.push(...e.pagination));
      this.setGridViewData();
    })
  }

  employeesAreAlreadyLoaded(totalEmployeesLoaded: number, totalEmployeesRequired: number): boolean {
    return totalEmployeesLoaded > totalEmployeesRequired;
  }

  thereIsNoGroup(group: any): boolean {
    return group && !group.length;
  }

  thereIsNofilter(filter: any): boolean {
    return filter.filters && !filter.filters.length;
  }

  thereIsOnefilter(filter: any): boolean {
    return filter.filters && filter.filters.length === 1;
  }

  resetCandidatesLoaded() {
    this.listCandidates = [];
  }

  resetGrid(): void {
    this.resetCandidatesLoaded();
    this.getCandidates();
  }

  loadCandidates(employees): void {
    for (const employee of employees.pagination) {
      this.listCandidates.push(employee)
    }
  }

  setGridViewData(): void {
    this.gridView = process(this.listCandidates, this.state)
    this.gridView.total = this.totalCandidates
    this.hideLoading()
  }

  showLoading(): void {
    this.loading = true;
  }

  hideLoading(): void {
    this.loading = false;
  }


}




