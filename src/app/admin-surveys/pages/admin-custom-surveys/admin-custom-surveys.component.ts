import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Survey } from '../../../shared/models/survey.model';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UserService } from '../../../shared/services/user.service';

import { AdminSurveysApiService } from '../../services/admin-surveys.api.services';

import { PageEvent } from '@angular/material/paginator';
import { Employee } from '../../../shared/models/employee.model';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from '../../../shared/services/shared-services/analytics.service';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesAdmin } from 'src/app/shared/models/logsMessages.interface';

@Component({
  selector: 'app-admin-custom-surveys',
  templateUrl: './admin-custom-surveys.component.html'
})
export class AdminCustomSurveysComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  totalPages: any;
  displayedColumns: string[] = ['name', 'state', 'actions'];
  firstTime = true;
  existingSurveys: any;

  user: Employee;

  personalData: any;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  // TS Literals
  tsLiterals: any;

  @Input() public employeePersonalData;
  @Input() public fromModal;
  pageEvent: PageEvent;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesAdmin;

  constructor(
    private apiService: AdminSurveysApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private logsService: LogsService,
    private translate: TranslateService) {
    this.user = this.userService.getUser();
    this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
  }

  ngOnInit() {
    this.analyticsService.addAnalytics({ accessTo: 'adminSurveys', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
    this.getSurveys();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );

    this.logsMessagesKeys = [
      'logsMessages.admin.clone',
      'logsMessages.admin.surveyCloneSuccess'
    ];
    this.getLogsTranslations();
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
    this.getSurveys();
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  getSurveys() {
    this.loading = true;
    return this.apiService.getAllCustomSurveys().subscribe((surveys: any[]) => {
      // surveys[0].state = 'published'; // TEMPORAL
      this.existingSurveys = surveys;
      this.dataSource = new MatTableDataSource<Survey>(surveys);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleError.bind(this));
  }

  deleteSurvey(survey: Survey): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteSurvey, message: this.tsLiterals.deleteAction } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.apiService.deleteCustomSurvey(survey._id).subscribe(() => this.handleSuccess(), this.handleError.bind(this));
      }
    });
  }

  cloneSurvey(survey: Survey): void {
    const clonedSurvey = JSON.parse(JSON.stringify(survey));
    ['_id', 'createdAt'].forEach(e => delete clonedSurvey[e]);
    clonedSurvey.title = clonedSurvey.title + ' ' + this.logsMessagesTranslations['logsMessages.admin.clone'];
    clonedSurvey.state = 'draft';
    this.apiService.createCustomSurvey(clonedSurvey).subscribe(() => {
      this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.surveyCloneSuccess']);
      this.getSurveys();
    });
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

}
