import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { mockOrganigrama } from './ejemplo_organigrama';
import { ApiService } from '../shared/services/api.service';
import { Employee } from '../shared/models/employee.model';
import { UserService } from '../shared/services/user.service';
import { CommonFunctions } from '../commonFunctions';
import { SearchModalOrgChartComponent } from 'src/app/search/search-modal-org-chart/search-modal-org-chart.component';
import { PersonalManagerDataModalComponent } from './personal-data-modal/personal-data-modal.component';
import { CardPositionModalComponent } from '../card-position/card-position-modal/card-position-modal.component';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { ConfigurationService } from '../shared/services/configuration.service';

@Component({
  selector: 'app-position-manager-chart',
  templateUrl: './position-manager-chart.component.html',
  styleUrls: ['./position-manager-chart.component.scss']
})
export class PositionManagerChartComponent implements OnInit, AfterViewChecked {
  itsMe = true;
  employee: Employee;
  config: any;

  data;
  mock = mockOrganigrama;
  permissions;
  showError = false;
  chartOrigin = {
    id: null,
    highlight: null
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userService: UserService,
    private dialog: MatDialog,
    private commonFunctions: CommonFunctions,
    private router: Router,
    private logsService: LogsService,
    private analyticsService: AnalyticsService,
    public configurationService: ConfigurationService) { }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    this.config = this.configurationService.getConfiguration();

    this.route.params.subscribe(params => {
      if (params['employeeId']) this.itsMe = false;
    });
    this.employee = this.userService.getUser();

    if (this.itsMe) { // si soy yo, pinto mi personal Data
      this.employee = this.userService.getUser();
      // console.log('This employee chart', this.employee);
      this.chartOrigin = { id: this.employee.id.toString(), highlight: this.employee.id.toString() };
      this.createOrgChart(this.employee.id.toString(), this.employee.id.toString());
    } else {
      // si no soy yo, evaluo que tenga permisos para verlo, recojo los datos del usuario por url y los pinto
      this.route.params.subscribe(params => {  // recojo el user de la url para pintar sus datos personales
        this.createOrgChart(params.employeeId, params.employeeId);
        this.chartOrigin = { id: params.employeeId, highlight: params.employeeId };
      });
    }

    this.analyticsService.addAnalytics({ accessTo: 'chart-manager', employee: this.employee, userAgent: window.navigator.userAgent }).subscribe();

  }

  ngAfterViewChecked() {
    this.setContainerMiddle();
  }

  resetChart() {
    this.createOrgChart(this.chartOrigin.id, this.chartOrigin.highlight);
  }

  createOrgChart(employeeId: string, highLight: string) {
    if (employeeId && highLight) {
      this.apiService.getOrgChart(employeeId, highLight, 'managers').subscribe(res => {
        if (res && res.message) {
          this.logsService.logError(res.message);
        } else {
          this.data = this.getRoot(res);
        }
      });
    } else {
      this.showError = true;
    }
  }

  openCardPositionModal(cardPosition) {
    // console.log('Open card', cardPosition);
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition.cardPositionId, title: cardPosition.name } });
  }

  openPersonalEmployeeDataDetail(employee) {
    // console.log('Open Emp', employee);
    this.dialog.open(PersonalManagerDataModalComponent, { data: { employeeId: employee.id, fullName: employee.fullName, modal: 'orgChart' } });
  }

  clickNode(node) {
    this.apiService.getOrgChart(node.id, this.employee.cardPosition.id, 'managers').subscribe(res => {
      this.data = this.getRoot(res);
    });
  }


  getRoot(data) {
    let root;
    for (let i = 0; i < data.length; i++) {
      const parent = data.find(element => element.id === data[i].parent);
      if (!parent) {
        root = data[i];
        continue;
      }
      if (!parent.children) { parent.children = []; }
      parent.children.push(data[i]);
    }
    // console.log('Data to chart', root);
    return [root];
  }

  setContainerMiddle() {
    // set positopn of scrollbar middle
    const divContainer = document.getElementsByClassName('chart-container')[0] as HTMLElement;
    const element = document.getElementsByClassName('highlight')[0] as HTMLElement;
    if (element) {
      const width = element.offsetLeft - divContainer.offsetWidth / 2;
      divContainer.scrollTo(width, 0);
    }
  }

  searchOrgChart() {
    this.dialog.open(SearchModalOrgChartComponent, { autoFocus: false })
      .afterClosed().subscribe(params => {
        if (params) {
          let url;
          this.route.queryParams.subscribe(qparams => {
            url = `organigrama/${params}`;
          });
          this.router.navigateByUrl(url);
        }
      });
  }
}
