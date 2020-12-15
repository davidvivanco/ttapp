import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';

import { AdminSurveysApiService } from '../../services/admin-surveys.api.services';


import { MatPaginator } from '@angular/material/paginator';
import { Employee } from '../../../shared/models/employee.model';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from '../../../shared/services/shared-services/analytics.service';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatSort, MatTableDataSource } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { DashboardFilter } from 'src/app/shared/models/dashboard-filter.model';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';

import { MY_FORMATS } from 'src/app/globals';
import { CustomSurveyBlock, CustomSurveyAnswer, CustomSurvey } from 'src/app/shared/models/custom-survey.model';
import { CustomSurveyQuestionModalComponent } from '../../components/modals/custom/question/question-modal.component';
import { CustomSurveyAnswerModalComponent } from '../../components/modals/custom/answer/answer-modal.component';
import { LogsMessagesAdmin } from 'src/app/shared/models/logsMessages.interface';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';

@Component({
  selector: 'app-admin-custom-surveys-block-form',
  templateUrl: './admin-custom-surveys-block-form.component.html',
  styleUrls: ['./admin-custom-surveys-block-form.component.scss'],
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
export class AdminCustomSurveysBlockFormComponent implements OnInit, ComponentCanDeactivate {

  loading = false;
  loadingPage = false;
  totalPages: any;
  firstTime = true;
  user: Employee;
  block: CustomSurveyBlock;
  blockId: string;
  blockForm: FormGroup;
  personalData: any;
  periodicityValues: any;
  dashboardVisibility: boolean;
  dashboardFilters: DashboardFilter[];
  newBlock: boolean;
  modifiedBlock: boolean;
  tsLiterals: any;
  surveyId: any;
  survey: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSources: MatTableDataSource<any>[];
  displayedColumns: string[] = ['name', 'actions'];
  // Custom Filter Predicate
  globalFilters: FormControl[];

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesAdmin;


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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _location: Location,
    private dateAdapter: DateAdapter<Date>) {
    this.user = this.userService.getUser();
    this.blockId = this.activatedRoute.snapshot.paramMap.get('block');
    this.surveyId = this.activatedRoute.snapshot.paramMap.get('survey');
    this.dataSources = [];
    this.globalFilters = [];

    this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
      const lang = window.sessionStorage.getItem('lang');
      this.dateAdapter.setLocale(lang);
    });
    this.newBlock = true;
  }

  ngOnInit() {
    this.getSurvey();
    this.analyticsService.addAnalytics({ accessTo: 'adminSurveys', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
    if (this.blockId) {
      this.loadingPage = true;
      this.getBlock(this.blockId);
    }
    if (!this.blockId) {
      this.block = new CustomSurveyBlock();
      this.createFormBlock();
    }

    this.logsMessagesKeys = [
      'logsMessages.admin.clone',
      'logsMessages.admin.surveyAnswerCloneSuccess'
    ];
    this.getLogsTranslations();
  }

  getSurvey() {
    this.apiService.getCustomSurvey(this.surveyId).subscribe(res => {
      this.survey = res[0];
    });
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

  getBlock(idBlock: string) {
    this.loading = true;
    return this.apiService.getCustomSurvey(this.surveyId).subscribe(res => {
      this.loading = false;
      this.loadingPage = false;
      const block = res[0].blocks.find(neededBlock => neededBlock._id === idBlock);
      this.createFormBlock(block);
      this.block = new CustomSurveyBlock(block);
      for (const [key, question] of Object.entries(this.block.questions)) {
        this.prepareQuestionTable(key, question.answers);
      }
      this.newBlock = false;
    }, this.handleError.bind(this));
  }

  createFormBlock(block?: CustomSurveyBlock) {
    this.blockForm = this.formBuilder.group({
      name: [block ? block.name : '', [Validators.required]]
    });
    this.onChanges();
  }

  onChanges(): void {
    this.blockForm.valueChanges.subscribe(val => {
      this.modifiedBlock = true;
    });
  }

  handleErrorQuestion() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccessQuestion() {
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  prepareQuestionTable(key, answersQuestion) {
    this.loading = true;
    return this.apiService.getAllCustomSurveys().subscribe((surveys: CustomSurvey[]) => {
      this.dataSources[key] = new MatTableDataSource<any>(answersQuestion);
      this.dataSources[key].paginator = this.paginator;
      this.dataSources[key].sort = this.sort;
      this.globalFilters[key] = new FormControl('');
      this.globalFilters[key].valueChanges
        .subscribe(
          str => {
            str = str.trim().toLowerCase();
            this.dataSources[key].filter = str;
          }
        );
      this.loading = false;
    }, this.handleSuccessQuestion.bind(this));
  }

  openQuestionModal(indexQuestion: number, data: any) {
    const dialog = this.dialog.open(CustomSurveyQuestionModalComponent, {
      data: { index: indexQuestion, info: data }
    });

    dialog.afterClosed().subscribe(question => {
      if (question) {
        if (question.info && question.index === -1) { // ADD
          this.block.questions.push(question.info);
          this.prepareQuestionTable(this.block.questions.length - 1, []);
          this.loading = true;
        } else if (question.info && question.index !== -1) { // EDIT
          this.block.questions[question.index] = question.info;
        }
        this.modifiedBlock = true;
      }
    });
  }

  deleteQuestion(indexQuestion: number, questionName: any): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: `${this.tsLiterals.deleteQuestion}: ${questionName}`,
        message: this.tsLiterals.deleteAction
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.block.questions.splice(indexQuestion, 1);
        this.modifiedBlock = true;
      }
    });
  }

  openAnswerModal(indexQuestion: number, indexAnswer: number, data: any) {
    const dialog = this.dialog.open(CustomSurveyAnswerModalComponent, {
      data: { indexQuestion: indexQuestion, indexAnswer: indexAnswer, info: data }
    });

    dialog.afterClosed().subscribe(answer => {
      if (answer) {
        if (answer.info && answer.indexAnswer === -1) { // ADD
          if (!this.block.questions[answer.indexQuestion].answers) this.block.questions[answer.indexQuestion].answers = [];
          this.block.questions[answer.indexQuestion].answers.push(answer.info);
          this.prepareQuestionTable(answer.indexQuestion, this.block.questions[answer.indexQuestion].answers);

        } else if (answer.info && answer.indexAnswer !== -1) { // EDIT
          this.block.questions[answer.indexQuestion].answers[answer.indexAnswer] = answer.info;
        }
        this.modifiedBlock = true;
      }
    });
  }

  cloneAnswer(indexQuestion: number, answer: CustomSurveyAnswer): void {
    const clonedAnswer = JSON.parse(JSON.stringify(answer));
    ['_id', 'createdAt'].forEach(e => delete clonedAnswer[e]);
    clonedAnswer.name = clonedAnswer.name + ' ' + this.logsMessagesTranslations['logsMessages.admin.clone'];
    this.block.questions[indexQuestion].answers.push(clonedAnswer);
    this.prepareQuestionTable(indexQuestion, this.block.questions[indexQuestion].answers);
    this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.surveyAnswerCloneSuccess']);
  }

  deleteAnswer(indexQuestion: number, answerQuestion: number, name: any): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: `${this.tsLiterals.deleteAnswer}: ${name}`,
        message: this.tsLiterals.deleteAction
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.block.questions[indexQuestion].answers.splice(answerQuestion, 1);
        this.prepareQuestionTable(indexQuestion, this.block.questions[indexQuestion].answers);
        this.modifiedBlock = true;
      }
    });
  }

  saveBlock() {
    if (this.blockForm.valid) {
      this.loading = true;
      const formData = this.blockForm.value;
      this.block.name = formData.name;

      if (this.newBlock) { // ADD
        this.apiService.getCustomSurvey(this.activatedRoute.snapshot.params.survey).subscribe(res => {
          res[0].blocks.push(this.block);
          this.apiService.updateCustomSurvey(res[0]).subscribe(updatedSurvey => {
            this.newBlock = false;
            this.modifiedBlock = false;
            this.handleSuccess();
            this.loading = false;
            const blocksArray = JSON.parse(JSON.stringify(updatedSurvey)).blocks;
            const searchedIndex = blocksArray.length - 1;
            this.router.navigate([`admin/cuestionarios/personalizados/edit/${this.surveyId}/bloque/edit/${blocksArray[searchedIndex]._id}`]);
          });
        });
      } else { // EDIT
        this.apiService.getCustomSurvey(this.activatedRoute.snapshot.params.survey).subscribe(res => {
          const blockIndex = res[0].blocks.findIndex(neededBlock => neededBlock._id === this.blockId);
          res[0].blocks[blockIndex] = this.block;
          this.apiService.updateCustomSurvey(res[0]).subscribe();
          this.newBlock = false;
          this.modifiedBlock = false;
          this.handleSuccess();
          this.loading = false;
        });
      }
    } else {
      this.markAsTouched();
    }
  }

  cancelBlock() {
        this.router.navigate([`admin/cuestionarios/personalizados/edit/${this.surveyId}`]);
  }

  markAsTouched() {
    Object.values(this.blockForm.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  canDeactivate() {
    return !this.modifiedBlock;
  }
}
