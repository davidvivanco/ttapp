import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Employee } from 'src/app/shared/models/employee.model';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UnitiesApiService } from '../../services/unities.api.service';
import { Unity } from 'src/app/shared/models/unity.model';
import { SearchModalUnitiesComponent } from 'src/app/search/search-modal-unities/search-modal-unities.component';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-unities',
  templateUrl: './unities.component.html'
})
export class UnitiesComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  totalPages: any;
  displayedColumns: string[] = ['name', 'actions'];
  existingUnities: any;
  private search: string = null;

  user: Employee;

  tsLiterals: any;
  searchModalLiterals: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private analyticsService: AnalyticsService,
    public dialog: MatDialog,
    private userService: UserService,
    private translate: TranslateService,
    private logsService: LogsService,
    private apiService: UnitiesApiService,
    private employeesApiService: ApiService,
  ) {
    this.user = this.userService.getUser();
    this.translate.get('unitiesAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
    this.translate.get('unitiesAdmin.search').subscribe((translated: string) => {
      if (translated) this.searchModalLiterals = translated;
    });
  }

  ngOnInit() {
    this.getUnities();
  }

  getUnities() {
    this.loading = true;
    return this.apiService.getAllUnities().subscribe((unities: any[]) => {
      this.existingUnities = unities;
      this.dataSource = new MatTableDataSource<Unity>(unities);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleError.bind(this));
  }

  deleteUnity(unity: Unity) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.deleteUnity, message: this.tsLiterals.deleteAction } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        unity.children.forEach(element => {
          this.apiService.getUnity(element).subscribe(child => {
            child.parentId = null;
            this.apiService.updateUnity(child._id, child).subscribe();
          });
        });
        unity.users.forEach(element => {
          this.employeesApiService.getOneEmployee(element).subscribe(user => {
            user.unityId = null;
            this.employeesApiService.editUserInfo(user._id, user).subscribe();
          });
        });
        this.apiService.deleteUnity(unity._id).subscribe(() => this.handleSuccess(), this.handleError.bind(this));
      }
    });
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccess() {
    this.getUnities();
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  searchUnities() {
    const title = this.searchModalLiterals.title;
    const description = this.searchModalLiterals.desc;
    const dialog = this.dialog.open(SearchModalUnitiesComponent, { data: { title: title, description: description }, autoFocus: false });
    dialog.afterClosed().subscribe(((searchStr: string) => {
      if (searchStr) {
        this.paginator.pageIndex = 0;
        this.search = searchStr.trim().toLowerCase();
        const searched = this.existingUnities.filter(r => r['name'].toLowerCase().indexOf(this.search) >= 0);
        this.dataSource = new MatTableDataSource<any>(searched.slice(0, this.paginator.pageSize));
      }
    }));
  }

  backToAll() {
    this.search = null;
    this.getUnities();
  }

}
