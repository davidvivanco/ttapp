import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Employee } from '../shared/models/employee.model';
import { PersonalData } from '../shared/models/personal-data.model';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { MatDialog } from '@angular/material';
import { ConfigurationService } from '../shared/services/configuration.service';
import { ConfigurationCompany, Services } from 'src/app/shared/models/configuration.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  employee: Employee;
  personalData: PersonalData;
  conf: ConfigurationCompany;
  public services: Services;

  constructor(
    private userService: UserService,
    private analyticsService: AnalyticsService,
    private dialog: MatDialog,
    private router: Router,
    public configurationService: ConfigurationService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.services = this.configurationService.getConfiguration().services;
    this.employee = this.userService.getUser();
    this.personalData = this.employee.personalData;
    this.activatedRoute.queryParams.subscribe(params => {
      let controlExtraData = params['controlExtraData'];
      if (controlExtraData) this.analyticsService.addAnalytics({ accessTo: 'homeFromExtraData', employee: this.employee, userAgent: window.navigator.userAgent }).subscribe();
      else this.analyticsService.addAnalytics({ accessTo: 'home', employee: this.employee, userAgent: window.navigator.userAgent }).subscribe();
    });
    this.conf = this.configurationService.getConfiguration();
  }

}
