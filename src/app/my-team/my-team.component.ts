import { Component, OnInit } from '@angular/core';
import { Employee } from '../shared/models/employee.model';
import { UserService } from '../shared/services/user.service';
import { ApiService } from '../shared/services/api.service';
import { MatDialog } from '@angular/material';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { CardPositionModalComponent } from '../card-position/card-position-modal/card-position-modal.component';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, filterBy } from '@progress/kendo-data-query';
import { PersonalDataModalComponent } from '../personal-data/personal-data-modal/personal-data-modal.component';
import { Router } from '@angular/router';
import { ConfigurationService } from '../shared/services/configuration.service';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html'
})
export class MyTeamComponent implements OnInit {

  myTeam: any[];
  user: Employee;
  dataProcessed: any[];

  conf: any;
  public gridData: GridDataResult;
  private cache: any = new Map();
  public rootData: any[];

  public filter: CompositeFilterDescriptor = {
    logic: 'and',
    filters: []
  };


  constructor(
    private userService: UserService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private analyticsService: AnalyticsService,
    private configurationService: ConfigurationService,
  ) {
    this.conf = this.configurationService.getConfiguration();
  }

  ngOnInit() {
    this.getMyTeam();
    this.user = this.userService.getUser();
  }

  checkUserInMyTeam(user) {
    return user.managerId.includes(this.user._id);
  }

  getMyTeam() {
    this.apiService.getManagerTeam().subscribe(res => {
      this.myTeam = res;
      this.processData();
    });
  }

  processData() {
    this.myTeam.forEach(person => {
      if (person.parent === this.user.id) {
        person.parent = null;
      }
    });
  }

  getChildren(processed: string[], employeeId: string) {
    const children = [];
    this.myTeam.forEach(element => {
      if (element.parent === employeeId) {
        const results = this.getChildren(processed, element.employeeId);
        processed = results.processed;
        element.children = results.children;
        children.push(element);
        processed.push(element.employeeId);
      }
    });
    return { children, processed };
  }

  openCardPositionModal(cardPosition) {
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition, title: cardPosition.name } });
  }

  public fetchChildren = (parent?: any): any[] => {
    if (this.cache.get(parent)) {
      return this.cache.get(parent);
    }

    let result;
    const items = parent ? parent.contents : this.myTeam;
    if (this.filter && this.filter.filters.length && items) {
      result = filterBy(items, {
        logic: 'or',
        filters: [this.filter, { // matches the current filter or a child matches the filter
          operator: (item: any) => {
            if (item.contents) {
              const children = this.fetchChildren(item);
              return children && children.length;
            }
          }
        }]
      });
    } else {
      result = items;
    }

    this.cache.set(parent, result);

    return result;
  }

  public hasChildren = (item: any): boolean => {
    const children = this.fetchChildren(item);
    return children && children.length > 0;
  }

  private loadData(): void {
    this.cache.clear();
    this.rootData = this.fetchChildren();
  }

  openPersonalEmployeeDataDetail(employee) {
    const dialog = this.dialog.open(PersonalDataModalComponent, { data: { employeeId: employee.employeeId, fullName: employee.name + ' ' + employee.lastName, modal: 'viewCardPosition' } });
    dialog.afterClosed().subscribe((isSave) => isSave && this.getMyTeam());
  }

  goToCVUser(user) {
    this.router.navigateByUrl(`curriculum/${user.employeeId}`);
  }
}
