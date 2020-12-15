import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { ConfigurationService } from '../shared/services/configuration.service';
import { Surveys, Survey } from '../shared/models/survey.model';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Employee } from '../shared/models/employee.model';
import { UserService } from '../shared/services/user.service';
import { CustomSurveyModalComponent } from '../shared/components/shared/modals/custom-survey-modal/custom-survey-modal.component';
import { TypeFormService } from '../shared/services/typeForm.service';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { LogsService } from '../shared/services/shared-services/logs.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html'
})
export class QuestsComponent implements OnInit {

  config: any;
  public showPendingSurveys: boolean;
  public surveys: Array<Survey>;
  public pendingSurveys: number;
  public dataSource: MatTableDataSource<Survey>;
  public displayedColumns: string[] = ['name', 'open'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private logsService: LogsService,
    private apiService: ApiService,
    public configurationService: ConfigurationService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    public typeFormService: TypeFormService,
    public dialog: MatDialog,
  ) {
    this.checkPendingSurveys();
  }

  ngOnInit() {
    this.config = this.configurationService.getConfiguration();
    this.showPendingSurveys = this.config.services.surveys;
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'personalAccount', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  checkPendingSurveys() {
    this.apiService.getPendingSurveys().subscribe((surveys: Surveys) => {
      this.surveys = surveys.pendingSurveys;
      // MOQUEADO
      /*  this.surveys.forEach(function (element) {
          element.surveyType = 'typeform';
        });
        this.surveys.push(this.surveys[this.surveys.length - 1]);
        this.surveys[this.surveys.length - 1].surveyType = 'custom';*/
      // MOQUEADO
      this.pendingSurveys = this.surveys.length;
      this.dataSource = new MatTableDataSource<Survey>(this.surveys);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openSurvey(typeformUrl: string, type: string, surveyIndex: number): void {
    let projectId: string;
    if (!environment.production) projectId = 'development';
    else {
      let tempString = environment.apiUrl.split('https://')[1]
      tempString = tempString.split('.appspot.com/')[0];
      projectId = tempString;
    }
    const user: Employee = this.userService.getUser();
    typeformUrl = typeformUrl
      .replace('|NAME|', `${user.personalData.name}`)
      .replace('|USERID|', `${user.id}`)
      .replace('|PROJECTID|', projectId)
      .replace('|TYPE|', `${type}`);

    this.typeFormService.openSurvey(
      typeformUrl, null,
      () => {
        this.surveys.splice(surveyIndex, 1);
        this.dataSource = new MatTableDataSource<Survey>(this.surveys);
      });
  }

  openCustomSurvey(survey) {
    const dialog = this.dialog.open(CustomSurveyModalComponent, {
      panelClass: 'full-screen-dialog',
      data: { survey /*index: indexQuestion, info: data*/ }
    });

    dialog.afterClosed().subscribe(data => {
      if (data) {
        /*if (data.info && data.index == -1) { //ADD
          this.block.questions.push(data.info);
          this.prepareQuestionTable(this.block.questions.length - 1, []);
          this.loading = true;
        } else if (data.info && data.index !== -1) { //EDIT
          this.block.questions[data.index] = data.info;
        }
        this.modifiedBlock = true;*/
      }
    });
  }

}
