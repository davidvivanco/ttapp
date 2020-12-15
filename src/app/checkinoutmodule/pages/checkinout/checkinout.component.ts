import { Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UserService } from '../../../shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../shared/services/event.service';

import { CheckinoutApiService } from '../../services/checkinout.api.services';

import { CommonFunctions } from 'src/app/commonFunctions';

import { tap } from 'rxjs/operators';

import { PageEvent } from '@angular/material/paginator';
import { Employee } from '../../../shared/models/employee.model';
import { AnalyticsService } from '../../../shared/services/shared-services/analytics.service';

@Component({
  selector: 'app-checkinout',
  templateUrl: './checkinout.component.html'
})
export class CheckinoutComponent implements OnInit, AfterViewInit, OnDestroy {

  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  totalPages: any;
  displayedColumns: string[] = ['type', 'time', 'comments'];
  firstTime = true;

  user: Employee;

  personalData: any;

  @Input() public employeePersonalData;
  @Input() public fromModal;
  pageEvent: PageEvent;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private apiService: CheckinoutApiService,
    private route: ActivatedRoute,
    private eventService: EventService,
    private userService: UserService,
    private analyticsService: AnalyticsService,
  ) {
    this.user = this.userService.getUser();
  }

  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  ngOnInit() {
    if (this.employeePersonalData) {
      const userId = this.employeePersonalData.id !== undefined ? this.employeePersonalData.id : this.employeePersonalData.employeeId;
      this.personalData = this.employeePersonalData.personalData ? this.employeePersonalData.personalData : this.employeePersonalData;
      this.getCheckInOuts({ id: userId });
    } else {
      this.getCheckInOuts({ id: this.user.id });
    }
    const subscription = this.eventService.newCheckInOut.subscribe(() => {
      this.getCheckInOuts();
    });
    this.eventService.setSubscription(subscription);
    this.analyticsService.addAnalytics({ accessTo: 'checkInOut-myChecks', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.getCheckInOuts({ page: this.paginator.pageIndex }))
      )
      .subscribe();
  }

  private replaceData(data) {
    data.forEach(element => {
      if (element.type === '0') {
        element.type = 'Salida';
      } else if (element.type === '1') {
        element.type = 'Entrada';
      }
    });
    return data;
  }

  applyFilter(filterValue: string) { // filtro de fichas de puesto por name
    filterValue = CommonFunctions.getCleanedString(filterValue);
    this.dataSource.filter = filterValue.toLowerCase().trim();
  }

  private getCheckInOuts(options?: { page?, sort?, limit?, id?}) {
    this.loading = true;
    if (options) {

      this.apiService.getCheckInOuts(options.page, options.sort, options.limit, options.id).subscribe((data: any) => {
        this.processData(data);
      });
    } else {
      this.apiService.getCheckInOuts().subscribe((data: any) => {
        this.processData(data);
      });
    }
  }

  processData(data) {
    const dataReplaced = this.replaceData(data.pagination);
    this.dataSource = new MatTableDataSource<any>(dataReplaced);
    if (this.firstTime) {
      this.firstTime = false;
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
    this.totalPages = data.total;
    this.loading = false;
  }

}
