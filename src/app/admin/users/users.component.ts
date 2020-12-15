import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { AssignRolModalComponent } from './assign-rol-modal/assign-rol-modal.component';
import { SearchEmployeeModalComponent } from './search-employee-modal/search-employee-modal.component';
import { Subscription, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EmployeesDataSource } from 'src/app/shared/services/employees.datasource';
import { Permissions } from '../../shared/models/permissions.model';
import { UserService } from '../../shared/services/user.service';
import { saveAs } from 'file-saver';
import { UploadTemplateModalComponent } from './upload-template-modal/upload-template-modal.component';
import { PersonalDataModalComponent } from '../../personal-data/personal-data-modal/personal-data-modal.component';
import { Employee } from '../../shared/models/employee.model';
import { DeleteConfirmationModalComponent } from '../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { UsersModalComponent } from './users-modal/users-modal.component';
import { UserInfoModalComponent } from './user-info/user-info-modal/user-info-modal.component';
import { EventService } from 'src/app/shared/services/event.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { CardPositionModalComponent } from 'src/app/card-position/card-position-modal/card-position-modal.component';
import { TranslationService } from '../../shared/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import localePy from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';



@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {

  public environment: ConfigurationCompany;

  public employeesSubscription: Subscription;
  public lang = window.sessionStorage.getItem('lang') || 'es';
  private page = 0;
  private pageSize = 10;
  private translationsKeys: Array<string>;
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;
  public search: string = null;
  permissions: Permissions;

  public loading = false;
  public dataSource: EmployeesDataSource;
  public displayedColumns: string[] = ['photo', 'personalData.name', 'personalData.lastName', 'position', 'roles', 'actions'];

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private userService: UserService,
    private eventService: EventService,
    private translate: TranslateService,
    private logsService: LogsService,
    private configurationService: ConfigurationService,
    private translateService: TranslateService,
    private tranlationService: TranslationService,
    private analyticsService: AnalyticsService) {
    registerLocaleData(localePy, 'es');
    const notificationSubscriptions = this.eventService.notification.subscribe((notificationData) => {
      if (notificationData && notificationData.type === '_200') this.loadEmployees();
    });
    this.eventService.setSubscription(notificationSubscriptions);
    this.environment = this.configurationService.getConfiguration();
  }

  private static downloadFile(data: any) {
    const blob = new Blob([data], { type: 'application/ms-excel' });
    const file = new File([blob], 'Employees.xlsx', { type: 'application/vnd.ms.excel' });
    saveAs(file);
  }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    this.dataSource = new EmployeesDataSource(this.apiService);
    this.dataSource.load(this.search, this.page, this.pageSize);
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'admin-users', employee: user, userAgent: window.navigator.userAgent }).subscribe();

    this.translationsKeys = [
      'modalTranslations.users.unsubscribeUser',
      'modalTranslations.users.unsubscribeUserMessage',
      'logsMessages.users.userAdded',
      'logsMessages.users.userEdited',
      'logsMessages.users.unsubscribeUserSuccess',
      'logsMessages.users.userRegistered',
      'logsMessages.users.downloadExcelTemplate',
      'logsMessages.common.downloadError',
      'logsMessages.common.downloadTemplateSuccess',
      'logsMessages.common.uploading',
      'logsMessages.common.uploadCancel'
    ];
    this.getTranslations();
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadEmployees())
      )
      .subscribe();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  loadEmployees() {
    this.dataSource.load(
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction);
  }

  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
    this.unsubscribePendingObservables();
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

  openAddSingleUser() {
    this.dialog.open(UsersModalComponent, { data: { modal: 'addSingleUser' } }).afterClosed().subscribe(response => {
      if (!response) return;
      if (response.status === 'success') {
        this.logsService.log(this.translations['logsMessages.users.userAdded']);
        this.loadEmployees();
        this.openEditPersonalData(response.employee);
      } else if (response.status.includes('Error')) {
        this.logsService.logError(response.status);
      } else if (response.status !== 'cancel') {
        this.logsService.logError(response.status);
      }
    });
  }

  openEditPersonalData(employee) {
    // console.log('Edit personal data', employee);
    const dialog = this.dialog.open(PersonalDataModalComponent,
      { data: { employeeId: employee.id, fullName: `${employee.personalData.name} ${employee.personalData.lastName}`, modal: 'editSingleUser' } });
    dialog.afterClosed().subscribe((isSave) => isSave && this.loadEmployees());
  }

  editUserInfo(employee: Employee) {
    // Fallback por si llegan mal los datos
    if (employee.managerId === null) employee.managerId = [];
    if (employee['manager'] === null) employee['manager'] = [];
    this.dialog.open(UserInfoModalComponent, { data: { employee: employee, modal: 'editSingleUser' } })
      .afterClosed().subscribe(response => {
        if (response === 'success') {
          this.logsService.log(this.translations['logsMessages.users.userEdited']);
          this.loadEmployees();
        } else if (response) this.logsService.logError(response);
      });
  }

  public openAssignRolModal(user) {
    const dialog = this.dialog.open(AssignRolModalComponent, {
      data: user,
      width: '500px',
    });

    dialog.afterClosed().subscribe((roles) => {
      if (roles) {
        const idRoles = roles.map(rol => rol._id);
        this.loading = true;
        this.apiService.assignUserRols(user._id, idRoles).subscribe(() => {
          this.loadEmployees();
        });
      }
    });
  }

  seeUserCardPosition(cardPosition) {
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition.id, title: cardPosition.name } });
  }

  unsubscribeUser(employee: Employee) {
    this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: `${this.translations['modalTranslations.users.unsubscribeUser']} ${employee.personalData.name} ${employee.personalData.lastName}`,
        message: this.translations['modalTranslations.users.unsubscribeUserMessage']
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.apiService.deleteOneEmployee(employee).subscribe(() => {
          this.logsService.log(this.translations['logsMessages.users.unsubscribeUserSuccess']);
          this.loadEmployees(); // si el rol es admin, los usuarios se siguen mostrando debido al borrado lógico del back
        }, error => {
          this.logsService.logError(error.error.message);
        });
      }
    });
  }

  registerUser(employee: Employee): void {
    this.apiService.editUserInfo(employee._id, { dropDate: null }).subscribe(data => {
      this.logsService.log(this.translations['logsMessages.users.userRegistered']);
      this.loadEmployees();
    });
  }

  downloadExcelTemplate() {
    this.logsService.logLoading(this.translations['logsMessages.users.downloadExcelTemplate']);
    this.apiService.downloadExcelTemplate().subscribe(excelFile => {
      // console.log(excelFile);
      if (excelFile.error) {
        this.logsService.logError(this.translations['logsMessages.common.downloadError']);
      } else {
        UsersComponent.downloadFile(excelFile);
        this.logsService.log(this.translations['logsMessages.common.downloadTemplateSuccess']);

      }
    });
  }

  uploadExcelTemplate() {
    const dialog = this.dialog.open(UploadTemplateModalComponent, { width: '500px' });

    dialog.afterClosed().subscribe(status => {
      if (status === 'success') this.logsService.log(this.translations['logsMessages.common.uploading']);
      if (status === 'cancelled') this.logsService.logError('logsMessages.common.uploadCancel');
    });
  }


  backToAll() {
    this.search = null;
    this.loadEmployees();
  }

}
