import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SearchEmployeeModalComponent } from '../../search-employee-modal/search-employee-modal.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatPaginator, MatSort } from '@angular/material';
import { EmployeesDataSource } from '../../../../shared/services/employees.datasource';
import { merge } from 'rxjs';
import { Permissions } from '../../../../shared/models/permissions.model';
import { ApiService } from '../../../../shared/services/api.service';
import { UserService } from '../../../../shared/services/user.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-assign-managers-modal',
  templateUrl: './assign-managers-modal.component.html',
  styleUrls: ['./assign-managers-modal.component.scss']
})
export class AssignManagersModalComponent implements OnInit, AfterViewInit {

  permissions: Permissions;
  public loading = false;
  public search: string = null;
  private page = 0;
  private pageSize = 5;
  public dataSource: EmployeesDataSource;
  public displayedColumns: string[] = ['photo', 'personalData.name', 'personalData.lastName', 'assign'];

  userManagers = {};
  selectedManagers: any[] = [];

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(public dialog: MatDialog, private apiService: ApiService, private userService: UserService, public dialogRef: MatDialogRef<AssignManagersModalComponent>, @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    if (this.data.userManagers) this.checkUserManagers(this.data.userManagers);
    this.dataSource = new EmployeesDataSource(this.apiService);
    this.dataSource.load(this.search, this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadEmployees())
      )
      .subscribe();
  }

  checkUserManagers(array) {
    array.map( e => {
      this.userManagers[e] = true;
    });
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

  loadEmployees() {
    this.dataSource.load(
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction);
  }

  backToAll() {
    this.search = null;
    this.loadEmployees();
  }

  close(): void {
    this.dialogRef.close({userManagers: this.data.userManagers, managersNames: this.data.managersNames});
  }

  toggleAssign(event) {
    // 1 - objeto que se encarga de pintar los checkboxes marcados o no
    // 2 - Array de managers original que llega en data
    if (event.checked) {
      this.userManagers[event.source.value._id] = true;
      if (!this.data.userManagers) this.data.userManagers = [];
      this.data.userManagers.push(event.source.value._id);
      this.data.managersNames[event.source.value._id] = event.source.value.personalData.name + ' ' + event.source.value.personalData.lastName;
    } else {
      this.userManagers[event.source.value._id] = false;
      delete this.userManagers[event.source.value._id];
      const tempArr = this.data.userManagers.filter( e => e !== event.source.value._id);
      if (tempArr.length > 0) this.data.userManagers = tempArr;
      else this.data.userManagers.length = 0;
      if (this.data.managersNames[event.source.value._id]) delete this.data.managersNames[event.source.value._id];
    }
  }

}
