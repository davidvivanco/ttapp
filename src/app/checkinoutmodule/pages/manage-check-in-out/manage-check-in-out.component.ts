import { Component, OnInit } from '@angular/core';
import { CheckinoutApiService } from '../../services/checkinout.api.services';
import { UserService } from '../../../shared/services/user.service';
import { Employee } from '../../../shared/models/employee.model';
import { MatDialog } from '@angular/material';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, filterBy } from '@progress/kendo-data-query';
import { SeeCheckInOutModalComponent } from '../../components/modals/seeCheckInOut-modal.component';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';

@Component({
  selector: 'app-manage-checkInOut',
  templateUrl: './manage-check-in-out.component.html'
})
export class ManageCheckInOutComponent implements OnInit {
  myTeam: any[];
  user: Employee;
  dataProcessed: any[];

  public gridData: GridDataResult;
  private cache: any = new Map();
  public rootData: any[];

  public filter: CompositeFilterDescriptor = {
    logic: 'and',
    filters: []
  };


  constructor(
    private apiService: CheckinoutApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.getMyTeam();
    this.user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'checkInOut-manager', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
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
      } else {
        person.parent = parseInt(person.parent);
      }
      person.employeeId = parseInt(person.employeeId);
    });
  }

  processDataOld() {
    this.dataProcessed = [];
    let processed = [];
    this.myTeam.forEach(person => {
      if (!processed.includes(person.employeeId)) {
        const resultsChildren = this.getChildren(processed, person.employeeId);
        person.children = resultsChildren.children;
        processed = resultsChildren.processed;
        this.dataProcessed.push(person);
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

  public seeCheckInOut(user?) {
    this.dialog.open(SeeCheckInOutModalComponent, {
      width: '750px',
      data: user,
    });
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
}
