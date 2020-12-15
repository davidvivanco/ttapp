import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TypeFormService } from '../../services/typeForm.service';
import { UserService } from '../../services/user.service';
import { Employee } from '../../models/employee.model';
import { Survey } from '../../models/survey.model';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SurveyModalComponent } from '../shared/modals/survey-modal/survey-modal.component';
import { CustomSurveyModalComponent } from '../shared/modals/custom-survey-modal/custom-survey-modal.component';
import { ConfigurationService } from '../../services/configuration.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-pending-surveys',
  templateUrl: './pending-surveys.component.html',
  styleUrls: ['./pending-surveys.component.scss']
})
export class PendingSurveysComponent implements OnInit {

  constructor(
    private typeFormService: TypeFormService,
    private userService: UserService,
    public configurationService: ConfigurationService,
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<SurveyModalComponent>,
    public dialog: MatDialog
  ) {
  }

  @Input() public surveys: Array<Survey>;
  @Input() public accountComponent = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public pendingSurveys: number;
  public dataSource: MatTableDataSource<Survey>;
  public userMessage: string;
  public displayedColumns: string[] = ['name', 'open'];



  ngOnInit() {
    // MOQUEADO
    /*this.surveys.forEach(function (element) {
      element.surveyType = "typeform";
    });
    this.surveys.push(this.surveys[this.surveys.length - 1]);
    this.surveys[this.surveys.length - 1].surveyType = "custom";*/
    // MOQUEADO
    this.pendingSurveys = this.surveys.length;
    this.dataSource = new MatTableDataSource(this.surveys);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.userMessage = this.getPendingSurveysMessage();
  }


  getPendingSurveysMessage(): string {
    if (this.pendingSurveys === 0) return `No tienes cuestionarios pendientes`;
    else if (this.pendingSurveys === 1) return `Tienes ${this.pendingSurveys} cuestionario pendiente`;
    else return `Tienes ${this.pendingSurveys} cuestionarios pendientes`;
  }

  openSurvey(typeformUrl: string, type: string, surveyIndex: number): void {
    const user: Employee = this.userService.getUser();
    let projectId: string;
    if (!environment.production) projectId = 'development';
    else {
      let tempString = environment.apiUrl.split('https://')[1]
      tempString = tempString.split('.appspot.com/')[0];
      projectId = tempString;
    }

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

  closeModal() {
    this.dialogRef.close();
  }

}
