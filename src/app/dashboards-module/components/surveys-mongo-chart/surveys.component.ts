import { Component, } from '@angular/core';
import { Survey } from '../../../shared/models/survey.model';
import localePy from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Dashboard } from '../../common/dashboard';
import { UserService } from '../../../shared/services/user.service';
import { MatSelectChange } from '@angular/material';
import { DashboardApiService } from '../../services/dahsboard.api.services';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})
export class SurveysMongoChartComponent extends Dashboard {

  loading = true;

  public surveys: Array<Survey> = [];
  public surveySelected: Survey;
  public controlPanelSelected: any = [];
  public filterSelects: Array<any> = [];

  constructor(
    public route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public apiService: DashboardApiService,
    public userService: UserService) {

    super(sanitizer, userService);
    registerLocaleData(localePy, 'es');
    this.showSpinner();
    this.route.queryParams.subscribe(qp => {
      this.apiService.getAllSurveys().subscribe((surveys: Array<Survey>) => {
        if (surveys && surveys.length) {
          this.surveys = surveys;
          for (const survey of this.surveys) {
            for (const row of survey.dashboard.rows) {
              this.dashboardMapper(row);
            }
          }
          const survey2 = this.thereIsSurveyParam(qp);
          if (survey2) this.changePanelControl(null, survey2);
          else {
            this.surveySelected = surveys[0];
            this.filterSelects = surveys[0].dashboard.selects;
            this.controlPanelSelected = this.surveys[0].dashboard.rows;
            this.hideSpinner();
          }
        }
      });
    });
  }



  showSpinner() {
    this.loading = true;
  }

  hideSpinner() {
    this.loading = false;
  }

  thereIsSurveyParam(qp): string {
    return qp.survey;
  }

  addQueryParamsToUrl(survey) {
    let url = window.location.href;
    url = url.split('?survey=')[0] + `?survey=${survey._id.toString()}`
    window.history.replaceState(null, null, url);
  }

  changePanelControl(e: MatSelectChange, id: string = null) {
    this.showSpinner()
    if (id) {
      this.surveySelected = this.surveys.find(survey => survey._id.toString() === id.toString());
      this.controlPanelSelected = this.surveySelected.dashboard.rows
      this.filterSelects = this.surveySelected.dashboard.selects;
    }
    else {
      this.surveySelected = this.surveys[e.value];
      this.controlPanelSelected = this.surveys[e.value].dashboard.rows;
      this.filterSelects = this.surveys[e.value].dashboard.selects;
      this.addQueryParamsToUrl(this.surveySelected);
    }
    this.hideSpinner();
  }
}
