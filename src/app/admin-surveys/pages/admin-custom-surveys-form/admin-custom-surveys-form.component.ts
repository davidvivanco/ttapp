import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Survey } from '../../../shared/models/survey.model';
import { UserService } from '../../../shared/services/user.service';

import { AdminSurveysApiService } from '../../services/admin-surveys.api.services';


import { MatPaginator } from '@angular/material/paginator';
import { Employee } from '../../../shared/models/employee.model';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from '../../../shared/services/shared-services/analytics.service';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatTableDataSource, MatSort } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';

import { MY_FORMATS } from 'src/app/globals';
import { CustomSurvey, CustomSurveyBlock } from 'src/app/shared/models/custom-survey.model';
import { LogsMessagesAdmin } from 'src/app/shared/models/logsMessages.interface';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';
import { Intervals } from '../../components/interfaces/periodicityIntervalValues';

@Component({
  selector: 'app-admin-custom-surveys',
  templateUrl: './admin-custom-surveys-form.component.html',
  styleUrls: ['./admin-custom-surveys-form.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AdminCustomSurveysFormComponent implements OnInit, ComponentCanDeactivate {

  loading = false;
  loadingPage = false;
  totalPages: any;
  user: Employee;
  survey: CustomSurvey;
  surveyId: string;
  surveyForm: FormGroup;
  newSurvey: boolean;
  modifiedSurvey: boolean;
  completeSurvey: boolean;

  tsLiterals: any;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesAdmin;
  periodicityIntervalValues: ReadonlyArray<Intervals>;

  minDate;
  maxDate;
  today: Date;
  initialDate;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];
  // Custom Filter Predicate
  globalFilter = new FormControl('');

  @Input() public fromModal;
  constructor(
    private apiService: AdminSurveysApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private logsService: LogsService,
    private translate: TranslateService,
    private router: Router,
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
    if (this.surveyId) {
      this.loadingPage = true;              // EDIT
      this.getSurvey(this.surveyId);
      this.newSurvey = false;
    } else {                     // NEW
      this.survey = new CustomSurvey();
      this.createFormSurvey();
    }

    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );

    this.logsMessagesKeys = [
      'logsMessages.admin.clone',
      'logsMessages.admin.surveyBlockCloneSuccess'
    ];
    this.getLogsTranslations();
    this.validateCalendar();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys).subscribe((translations: LogsMessagesAdmin) => {
      this.logsMessagesTranslations = translations;
    });
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
    return this.apiService.getCustomSurvey(idSurvey).subscribe((survey: CustomSurvey) => {
      this.loading = false;
      this.loadingPage = false;
      this.survey = survey[0];
      this.createFormSurvey(this.survey);
      this.prepareBlocksTable();
    }, this.handleError.bind(this));
  }

  handleErrorBlocks() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccessBlocks() {
    this.prepareBlocksTable();
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  prepareBlocksTable() {
    this.loading = true;
    this.dataSource = new MatTableDataSource<CustomSurveyBlock>([]);
    return this.apiService.getAllSurveys().subscribe((surveys: Survey[]) => {
      this.dataSource = new MatTableDataSource<CustomSurveyBlock>(this.survey.blocks);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleErrorBlocks.bind(this));
  }

  createFormSurvey(survey?: CustomSurvey) {
    this.surveyForm = this.formBuilder.group({
      name: [survey ? survey.title : '', [Validators.required]],
      welcomeText: [survey ? survey.welcomeText : '', []],
      feedbackText: [survey ? survey.feedbackText : '', []],
      startDate: [survey ? survey.startDate : '', []],
      finishDate: [survey ? survey.finishDate : '', []],
      periodicityUnit: [survey ? survey.periodicity.value : '', [Validators.min(1)]],
      periodicityInterval: [survey ? survey.periodicity.type : '', []],
      mandatoryAnswers: [survey ? survey.mandatoryAnswers : false, []],
      mandatoryAnswersNumber: [survey ? survey.mandatoryAnswersNumber : 0, [Validators.min(0)]],
      userCanSeeReport: [survey ? survey.userCanSeeReport : false, []]
    });
    this.onChanges();
    this.checkCompleteSurvey();
  }

  onChanges(): void {
    this.surveyForm.valueChanges.subscribe(val => {
      this.modifiedSurvey = true;
      this.checkCompleteSurvey();
    });
  }

  addBlock() {
    if (this.surveyForm.value.name && this.surveyForm.value.name !== '') {
      this.saveSurvey(this.goToAddBlock);
    } else {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.needToWriteTitle, message: this.tsLiterals.needToWriteTitleAction, hideCancel: true } });
      dialog.afterClosed().subscribe(accepts => { this.markAsTouched(); });
    }
  }

  changeState(state: string) {
    // API CALL TO CHANGE THE SURVEY CURRENT STATE
    this.survey.state = state;
    this.saveSurvey();
  }

  saveSurvey(callBack?: Function, block?: CustomSurveyBlock) {
    if (this.surveyForm.valid) {
      this.loading = true;
      const formData = this.surveyForm.value;
      this.survey.title = formData.name;
      this.survey.welcomeText = formData.welcomeText;
      this.survey.feedbackText = formData.feedbackText;
      this.survey.startDate = formData.startDate;
      this.survey.finishDate = formData.finishDate;
      this.survey.periodicity.value = formData.periodicityUnit;
      this.survey.periodicity.type = formData.periodicityInterval;
      this.survey.mandatoryAnswers = formData.mandatoryAnswers;
      this.survey.mandatoryAnswersNumber = formData.mandatoryAnswersNumber;
      this.survey.userCanSeeReport = formData.userCanSeeReport;

      if (this.newSurvey) { // ADD
        this.apiService.createCustomSurvey(this.survey).subscribe((survey: CustomSurvey) => {
          this.surveyId = survey._id;
          if (callBack) {
            const that = this;
            if (!block) {
              callBack(that, this.surveyId);
            } else {
              callBack(that, this.surveyId, block._id);
            }
            this.loading = false;
          } else {
            this.loading = false;
            this.router.navigate([`/admin/cuestionarios/personalizados/edit/${this.surveyId}`]);
          }
        }, this.handleError.bind(this));
      } else { // EDIT
        this.apiService.updateCustomSurvey(this.survey).subscribe((survey: CustomSurvey) => {
          if (callBack) {
            const that = this;
            if (!block) {
              callBack(that, this.surveyId);
            } else {
              let elem = survey.blocks.find(item => item.name === block.name);
              callBack(that, this.surveyId, elem._id);
            }
          }
          this.loading = false;
        }, this.handleError.bind(this));
      }

      // TEMPORAL --> METER DENTRO DE SUBSCRIBE

      this.newSurvey = false;
      this.modifiedSurvey = false;
      if (!callBack) this.handleSuccess();
    } else {
      this.markAsTouched();
    }
  }

  goToAddBlock(that?, idSurvey?, idBlock?) {
    const url = idSurvey ? (
      idBlock ? '/admin/cuestionarios/personalizados/edit/' + idSurvey + '/bloque/edit/' + idBlock
        : '/admin/cuestionarios/personalizados/edit/' + idSurvey + '/bloque/add'
    ) : 'bloque/add';
    if (that) {
      if (idSurvey) {
        that.router.navigate([url]);
      } else {
        that.router.navigate([url], { relativeTo: that.activatedRoute });
      }
    } else {
      if (idSurvey) {
        this.router.navigate([url]);
      } else {
        this.router.navigate([url], { relativeTo: this.activatedRoute });
      }
    }
  }

  markAsTouched() {
    Object.values(this.surveyForm.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  cancelSurvey() {
    this.router.navigate(['/admin/cuestionarios/personalizados']);
  }

  editBlock(block: CustomSurveyBlock) {
    this.saveSurvey(this.goToAddBlock, block);
  }

  deleteBlock(element: any): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: `${this.tsLiterals.deleteSurveyBlock}: ${element.name}`,
        message: this.tsLiterals.deleteAction
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        const indexBlock = this.survey.blocks.findIndex(index => index._id === element._id);
        this.survey.blocks.splice(indexBlock, 1);
        this.prepareBlocksTable();
        this.checkCompleteSurvey();
        this.modifiedSurvey = true;
      }
    });
  }

  cloneBlock(block: CustomSurveyBlock): void {
    const clonedBlock = JSON.parse(JSON.stringify(block));
    ['_id', 'createdAt'].forEach(e => delete clonedBlock[e]);
    clonedBlock.name = clonedBlock.name + ' ' + this.logsMessagesTranslations['logsMessages.admin.clone'];
    this.survey.blocks.push(clonedBlock);
    this.prepareBlocksTable();
    this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.surveyBlockCloneSuccess']);
    this.modifiedSurvey = true;
  }

  checkCompleteSurvey() {
    this.completeSurvey = true;

    const formData = this.surveyForm.value;
    for (const formElement of Object.values(formData)) {
      switch (typeof formElement) {
        case 'string':
          if (!formElement || formElement == null || formElement === '') {
            this.completeSurvey = false;
          }
          break;
        case 'number':
          if (formElement == null || formElement < 0) {
            this.completeSurvey = false;
          }
          break;
        case 'object':
          if (formElement == null) {
            this.completeSurvey = false;
          }
          break;
      }
    }

    let haveQuestionInsideBlock = false;
    for (const block of this.survey.blocks) {
      for (const questions of block.questions) {
        haveQuestionInsideBlock = true;
        break;
      }
    }
    if (!haveQuestionInsideBlock) this.completeSurvey = false;

    if (!this.completeSurvey) this.survey.state = 'incomplete';

    return;
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

  validateCalendar() {
    const initial = new (Date);
    initial.setDate(initial.getDate() + 1);
    this.initialDate = initial;
  }

  canDeactivate() {
    return !this.modifiedSurvey;
  }
}
