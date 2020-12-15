import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { SearchEmployeeModalComponent } from '../../../admin/users/search-employee-modal/search-employee-modal.component';
import { Subscription, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EmployeesDataSource } from 'src/app/shared/services/employees.datasource';
import { SeeCheckInOutModalComponent } from '../../components/modals/seeCheckInOut-modal.component';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-manage-checkInOut-company',
  templateUrl: './manage-check-in-out-company.component.html'
})
export class ManageCheckInOutCompanyComponent implements OnInit, AfterViewInit, OnDestroy {

  public employeesSubscription: Subscription;

  private page = 0;
  private pageSize = 10;
  public search: string = null;

  public loading = false;
  public dataSource: EmployeesDataSource;
  public displayedColumns: string[] = ['photo', 'personalData.name', 'personalData.lastName', 'position', 'actions'];

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private userService: UserService) {
  }

  ngOnInit() {
    this.dataSource = new EmployeesDataSource(this.apiService);
    this.dataSource.load(this.search, this.page, this.pageSize);
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'checkInOut-admin', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadEmployees())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  loadEmployees() {
    this.dataSource.load(
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction);
  }

  private unsubscribePendingObservables() {
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
  }

  public openSearchEmployeeModal(user?) {
    const dialog = this.dialog.open(SearchEmployeeModalComponent, {
      data: user,
    });

    dialog.afterClosed().subscribe(((searchStr: string) => {
      if (searchStr) {
        this.paginator.pageIndex = 0;
        this.search = searchStr;
        this.loadEmployees();
      }
    }));
  }

  public seeCheckInOut(user?) {
    this.dialog.open(SeeCheckInOutModalComponent, {
      width: '750px',
      data: user,
    });

  }
}
