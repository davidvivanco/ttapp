import { Component, Input, OnInit } from '@angular/core';
import { DashboardApiService } from '../../services/dahsboard.api.services';
import { Dashboards } from './interfaces/main-dashboards';
import { MatExpansionPanel } from '@angular/material';


@Component({
  selector: 'app-apex-charts',
  templateUrl: './apex-charts.component.html',
  styleUrls: ['./apex-charts.component.scss'],

})
export class ApexChartsComponent implements OnInit {
  data: Array<any>;
  dashboards: Array<Dashboards>;
  dashboardSelected: Dashboards;
  loading: boolean;
  resetFiltersForm: boolean;
  globalFilterVisible: boolean;
  filterSelected: boolean;
  surveysDictionary = {
    survey: [
      '5f3260a1a66dc4000a57247b'
    ],
    global: [
      '5faa5224bc78d62264086a53'
    ]
  }

  @Input() typeDashboard: string;

  constructor(
    private api: DashboardApiService
  ) {
    this.resetFiltersForm = false;
    this.globalFilterVisible = false;
    this.showLoading();
  }

  ngOnInit() {
    this.api.getDashboardById(this.surveysDictionary[this.typeDashboard][0]).subscribe(dashboard => {
      this.dashboards = [dashboard];
      this.dashboardSelected = dashboard;
      this.hideLoading();
    });
  }

  getSurveys() {
    this.api.getAllApexSurveys(this.typeDashboard).subscribe(dashboards => {
      this.dashboards = dashboards;
      this.dashboardSelected = this.dashboards[0];
      console.log('dashboard', this.dashboardSelected);

      this.hideLoading();
    });
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }

  changePanelControl(e) {
    this.resetFiltersForm = true;
    this.filterSelected = false;
    this.api.getDashboardById(this.surveysDictionary[this.typeDashboard][e.value]).subscribe(dashboard => {
      this.dashboards = [dashboard];
      this.dashboardSelected = dashboard;
      this.hideLoading();
    });

  }

  refreshData() {
    this.showLoading();
    this.dashboards = [];
    this.dashboardSelected = null;
    this.getSurveys();
  }

  applyFilters(filters, mep: MatExpansionPanel) {
    this.showLoading();
    mep.close();
    this.filterSelected = Object.values(filters).some((f: any) => f.length > 0)
    Object.keys(filters).forEach(key => {
      filters[key] = filters[key].join(',');
    });

    this.api.getDashboardById(this.dashboardSelected._id, filters).subscribe(dashboard => {
      this.dashboardSelected = dashboard;
      this.hideLoading();
    });
  }
}
