import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Employee } from '../../shared/models/employee.model';
import { CardPositionModalComponent } from 'src/app/card-position/card-position-modal/card-position-modal.component';
import { PersonalDataModalComponent } from 'src/app/personal-data/personal-data-modal/personal-data-modal.component';
import { UserService } from 'src/app/shared/services/user.service';
import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { CommonFunctions } from '../../commonFunctions';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  user: Employee;
  permissions;
  dataSource = new MatTableDataSource<any>([]);
  noResults = true;
  search: string;
  loading = true;
  itsMe = true;
  public paginatorSize: number;
  private elementsPerPage = 5;
  private lang = window.sessionStorage.getItem('lang') || 'es';

  conf: any;

  displayedColumns: string[] = ['photo', 'userInfo', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private configurationService: ConfigurationService
  ) {
    registerLocaleData(localePy, 'es');
    this.conf = this.configurationService.getConfiguration();
    this.dataSource = new MatTableDataSource<any>(null); // Show the load spinner
  }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    // recojo el parámetro que paso por la url para hacer la búsqueda
    this.route.queryParams.subscribe(params => {
      this.search = params.search;
      this.apiService.searchEmployee(this.search, 0, this.elementsPerPage).subscribe(res => {
        this.paginatorSize = res.total;
        this.loading = false;
        if (res.documents.length > 0) {
          this.noResults = false;
          this.getPermisosEditCurriculum();
          this.generateUsersTable(res.documents);
        } else {
          this.noResults = true;
          this.dataSource = new MatTableDataSource<any>(null);
        }
      });
    });
  }

  getPermisosEditCurriculum() {
    this.user = this.userService.getUser();
  }

  checkImAdmin() {
    const roles: any = this.user.roles as unknown;
    return roles.find(rol => rol.name === 'admin');
  }

  checkRolCurriculums() {
    const roles: any = this.user.roles as unknown;
    return roles.find(rol => rol.name === 'curriculums_admin');
  }

  checkUserInMyTeam(user: Employee) {
    return user.managerId.includes(this.user._id);
  }

  checkItsMe(user: Employee) {
    return user.id === this.user.id;
  }

  turnThePage(page: number) {
    this.apiService.searchEmployee(this.search, page, this.elementsPerPage).subscribe(res => {
      if (res.documents.length > 0) {
        this.noResults = false;
        this.dataSource = new MatTableDataSource<Employee>(res.documents);
      } else {
        this.noResults = true;
        this.dataSource = new MatTableDataSource<any>(null);
      }
    });
  }


  pageEvents(event: any) {
    this.elementsPerPage = event.pageSize;
    this.turnThePage(event.pageIndex);
    // The code that you want to execute on clicking on next and previous buttons will be written here.
  }

  generateUsersTable(arrEmployees) {
    this.dataSource = new MatTableDataSource<Employee>(arrEmployees);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

  }

  openCardPositionModal(cardPosition) {
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition.id, title: cardPosition.name } });
  }

  openPersonalEmployeeDataDetail(employee) {
    this.dialog.open(PersonalDataModalComponent, { data: { employeeId: employee.id, fullName: employee.personalData.name + ' ' + employee.personalData.lastName } });
  }

  goToCVUser(user) {
    this.router.navigateByUrl(`curriculum/${user.id}`);
  }

}
