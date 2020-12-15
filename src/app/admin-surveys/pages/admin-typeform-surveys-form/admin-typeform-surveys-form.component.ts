import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Survey } from '../../../shared/models/survey.model';
import { TypeformSurveyModalComponent } from '../../components/modals/typeform/typeform-survey-modal.component';
import { UserService } from '../../../shared/services/user.service';

import { AdminSurveysApiService } from '../../services/admin-surveys.api.services';

import { Employee } from '../../../shared/models/employee.model';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from '../../../shared/services/shared-services/analytics.service';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DashboardFilter } from 'src/app/shared/models/dashboard-filter.model';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';

import { MY_FORMATS } from 'src/app/globals';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';
import { Intervals } from '../../components/interfaces/periodicityIntervalValues';

@Component({
  selector: 'app-admin-typeform-surveys',
  templateUrl: './admin-typeform-surveys-form.component.html',
  styleUrls: ['./admin-typeform-surveys-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AdminTypeformSurveysFormComponent implements OnInit, ComponentCanDeactivate {

  loading = false;
  totalPages: any;
  firstTime = true;
  user: Employee;
  survey: Survey;
  surveyId: string;
  surveyForm: FormGroup;
  personalData: any;
  dashboardVisibility: boolean;
  dashboardFilters: DashboardFilter[];
  newSurvey: boolean;
  modifiedSurvey: boolean;
  tsLiterals: any;
  today: Date;
  minDate: Date;
  maxDate: Date;
  periodicityIntervalValues: ReadonlyArray<Intervals>;

  @Input() public employeePersonalData;
  @Input() public fromModal;
  @ViewChild('dashboardFiltersSelect') dashboardFiltersSelect;
  constructor(
    private apiService: AdminSurveysApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private logsService: LogsService,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _location: Location,
    private dateAdapter: DateAdapter<Date>) {
    this.user = this.userService.getUser();
    this.surveyId = this.activatedRoute.snapshot.paramMap.get('survey');
    this.periodicityIntervalValues =
      [
        { key: 'times-done', value: 'times-done' },
        { key: 'logins', value: 'logins' },
        { key: 'days', value: 'days' },
        { key: 'months', value: 'months' },
        { key: 'years', value: 'years' }
      ];
    this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;

      const lang = window.sessionStorage.getItem('lang');
      this.dateAdapter.setLocale(lang);
    });
    this.newSurvey = true;
    this.today = new Date();
  }

  ngOnInit() {
    this.analyticsService.addAnalytics({ accessTo: 'adminSurveys', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
    if (this.surveyId) this.getSurvey(this.surveyId);
    if (!this.surveyId) {
      this.survey = new Survey();
      this.getDashboardFilters();
      this.createFormSurvey();
    }
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccess() {
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  getSurvey(idSurvey: string) {
    this.loading = true;
    return this.apiService.getSurvey(idSurvey).subscribe((survey: Survey) => {
      this.loading = false;
      this.createFormSurvey(survey);
      this.survey = survey;
      this.getDashboardFilters();
      if (survey.dashboard && (survey.dashboard.rows.length > 0 || survey.dashboard.selects.length > 0)) this.dashboardVisibility = true;
      this.newSurvey = false;
    }, this.handleError.bind(this));
  }

  createFormSurvey(survey?: Survey) {
    this.surveyForm = this.formBuilder.group({
      title: [survey ? survey.title : '', [Validators.required]],
      desc: [survey ? survey.desc : '', [Validators.required]],
      startDate: [survey ? survey.startDate : '', [Validators.required]],
      finishDate: [survey ? survey.finishDate : '', [Validators.required]],
      periodicityUnit: [survey ? survey.periodicity.value : '', [Validators.required, Validators.min(1)]],
      periodicityInterval: [survey ? survey.periodicity.type : '', [Validators.required]],
      typeformUrl: [survey ? survey.typeformUrl : '', [Validators.required]]
    });
    this.onChanges();
  }

  onChanges(): void {
    this.surveyForm.valueChanges.subscribe(val => {
      this.modifiedSurvey = true;
    });
  }

  setDashboardVisibility() {
    if (this.dashboardVisibility) {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteDashboard, message: this.tsLiterals.deleteAction } });
      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.loading = true;
          this.dashboardVisibility = !this.dashboardVisibility;
          this.dashboardFilters.push(...this.survey.dashboard.selects);
          this.survey.dashboard = { rows: [], selects: [] };
          this.modifiedSurvey = true;
        }
      });
    } else {
      this.dashboardVisibility = !this.dashboardVisibility;
    }
  }

  getDashboardFilters() {
    this.loading = true;
    return this.apiService.getAllDashboardFilters().subscribe((dashboardFilters: DashboardFilter[]) => {
      this.loading = false;
      if (this.survey && this.survey.dashboard && this.survey.dashboard.selects.length > 0) {
        this.dashboardFilters = dashboardFilters.filter(df => this.survey.dashboard.selects.find(select => select.id !== df.id));
      } else this.dashboardFilters = dashboardFilters;
    }, this.handleError.bind(this));
  }

  saveNewChip(filterToAdd, input?) {
    const indexFilter = this.dashboardFilters.findIndex(df => df.id === filterToAdd);
    if (indexFilter >= 0) {
      this.survey.dashboard.selects.push(this.dashboardFilters[indexFilter]);
      this.dashboardFilters.splice(indexFilter, 1);
      if (input && input.length) input.map(inp => inp.value = '');
      this.modifiedSurvey = true;
    }
  }

  deleteMatChip(filterToDelete) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteFilter, message: this.tsLiterals.deleteActionGlobalFilter } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        const indexFilter = this.survey.dashboard.selects.findIndex(df => df.id === filterToDelete);
        if (indexFilter >= 0) {
          // BORRADO FILTRO CUADRO DE MANDOS
          this.dashboardFilters.push(this.survey.dashboard.selects[indexFilter]);
          this.survey.dashboard.selects.splice(indexFilter, 1);

          // BORRADO FILTROS GRÁFICOS
          for (const row of this.survey.dashboard.rows) {
            for (let col of row.cols) {
              col.select = col.select.filter(element => element !== filterToDelete);
            }
          }

          // MARCAMOS COMO MODIFICADO EL FORMULARIO
          this.modifiedSurvey = true;
        }
      }
    });
  }

  openSurveyModal(type: string, rowPointer, colPointer, inf: any) {
    const dialog = this.dialog.open(TypeformSurveyModalComponent, {
      data: { type: type, pointers: { rowPointer, colPointer }, info: inf, dashboardFilters: this.survey.dashboard.selects }
    });

    dialog.afterClosed().subscribe(data => {
      if (data) {
        if (data.type && data.type === 'row') { // ROW
          if (data.info && data.pointers.rowPointer === -1) { // ADD
            if (!this.survey.dashboard.rows) this.survey.dashboard.rows = [];
            this.survey.dashboard.rows.push(data.info);
          } else { // EDIT
            this.survey.dashboard.rows[data.pointers.rowPointer].name = data.info.name;
          }
        } else if (data.type && data.type === 'col') { // COL
          if (data.info && data.pointers.rowPointer !== -1 && data.pointers.colPointer === -1) { // ADD
            if (!this.survey.dashboard.rows[data.pointers.rowPointer].cols) this.survey.dashboard.rows[data.pointers.rowPointer].cols = [];
            this.survey.dashboard.rows[data.pointers.rowPointer].cols.push(data.info);
          } else { // EDIT
            this.survey.dashboard.rows[data.pointers.rowPointer].cols[data.pointers.colPointer] = data.info;
          }
        }
        this.loading = true;
        this.modifiedSurvey = true;
      }
    });
  }

  deleteRow(rowPointer): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteRow, message: this.tsLiterals.deleteAction } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.survey.dashboard.rows.splice(rowPointer, 1);
        this.modifiedSurvey = true;
      }
    });
  }

  deleteCol(rowPointer, colPointer): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteCol, message: this.tsLiterals.deleteAction } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.survey.dashboard.rows[rowPointer].cols.splice(colPointer, 1);
        this.modifiedSurvey = true;
      }
    });
  }

  saveSurvey() {
    if (this.surveyForm.valid) {
      this.loading = true;
      const formData = this.surveyForm.value;
      this.survey.title = formData.title;
      this.survey.desc = formData.desc;
      this.survey.startDate = formData.startDate;
      this.survey.finishDate = formData.finishDate;
      this.survey.periodicity.value = formData.periodicityUnit;
      this.survey.periodicity.type = formData.periodicityInterval;
      this.survey.typeformUrl = formData.typeformUrl;

      if (this.newSurvey) { // ADD
        this.apiService.createSurvey(this.survey).subscribe((survey: Survey) => {
          this.loading = false;
        }, this.handleError.bind(this));
      } else { // EDIT
        this.apiService.updateSurvey(this.survey).subscribe((survey: Survey) => {
          this.loading = false;
        }, this.handleError.bind(this));
      }

      this.newSurvey = false;
      this.modifiedSurvey = false;
      this.handleSuccess();
    } else {
      this.markAsTouched();
    }
  }

  cancelSurvey() {
    this._location.back();
  }

  markAsTouched() {
    Object.values(this.surveyForm.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.survey.dashboard.rows, event.previousIndex, event.currentIndex);
  }

  changeState(state: string) {
    // API CALL TO CHANGE THE SURVEY CURRENT STATE
    this.survey.state = state;
    this.saveSurvey();
  }

  setValue(index, date) {
    if (index === 0) {
      const dateMin = new Date(date.value);
      // Le sumo 1 al dia, porque en el date de Material, el primer dia del mes es 0
      dateMin.setDate(dateMin.getDate() + 1);
      this.minDate = dateMin;
    } else if (index === 1) {
      const dateMax = new Date(date.value);
      // Le resto 1 al dia, porque en el date de Material
      dateMax.setDate(dateMax.getDate() - 1);
      this.maxDate = dateMax;
    }
  }

  canDeactivate() {
    return !this.modifiedSurvey;
  }
}
