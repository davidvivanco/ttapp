import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { EventService } from 'src/app/shared/services/event.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Employee } from 'src/app/shared/models/employee.model';
import { TranslateService } from '@ngx-translate/core';
import { element } from 'protractor';

@Component({
  selector: 'app-users-modal',
  templateUrl: './users-modal.component.html'
})
export class UsersUnityModalComponent implements OnInit {
  public environment: ConfigurationCompany;

  public employeesSubscription: Subscription;
  public lang = window.sessionStorage.getItem('lang') || 'es';
  public pageSize = 5;
  public currentPage = 0;
  public totalSize = 0;
  public search: string;
  existingEmployees: any;

  public loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['photo', 'personalData.name', 'personalData.lastName', 'check'];

  elementSelected: any;
  elementsSelected: Array<any>;
  globalFilter: FormControl;
  isTextToggled: boolean;
  multiple = true;

  tsLiterals: any;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  @Output() onClose: EventEmitter<true>;
  @Output() onSubmit: EventEmitter<any>;
  @Output() onCancel: EventEmitter<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    public dialog: MatDialog,
    private userService: UserService,
    private eventService: EventService,
    private logsService: LogsService,
    private configurationService: ConfigurationService,
    private tranlationService: TranslationService,
    private analyticsService: AnalyticsService,
    public dialogRef: MatDialogRef<UsersUnityModalComponent>,
    private translate: TranslateService,
  ) {
    this.onClose = new EventEmitter();
    this.onCancel = new EventEmitter();
    this.onSubmit = new EventEmitter();
    this.globalFilter = new FormControl('');
    this.elementsSelected = [];
    this.isTextToggled = false;

    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.currentPage = 0;
          if (!str) {
            this.dataSource = new MatTableDataSource<any>(this.existingEmployees.slice(0, 5));
            this.pageSize = 5;
            this.totalSize = this.existingEmployees.length;
          }
          this.search = str.trim().toLowerCase();
          const searched = this.existingEmployees.filter(r => r['searchTags'] && r['searchTags'].toLowerCase().indexOf(this.search) >= 0)
          this.dataSource = new MatTableDataSource<any>(searched.slice(0, this.pageSize));
          this.totalSize = searched.length;
        }
      );

    this.environment = this.configurationService.getConfiguration();

    this.translate.get('unitiesAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
  }

  ngOnInit() {
    this.loading = true;
    this.getEmployees();
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'admin-users', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccess() {
    this.getEmployees();
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  getEmployees() {
    this.loading = true;
    return this.apiService.getEmployeesWithoutUnity().subscribe((employees: any[]) => {
      this.existingEmployees = employees;
      this.dataSource = new MatTableDataSource<Employee>(employees);
      this.data.users.forEach(user => {
        const userIndex = this.dataSource.filteredData.findIndex(emp => emp._id === user._id);
        if (userIndex !== -1) {
          this.dataSource.filteredData.splice(userIndex, 1);
        }
      });
      this.pageSize = 5;
      this.currentPage = 0;
      this.totalSize = this.existingEmployees.length;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleError.bind(this));
  }

  handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
  }

  iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.existingEmployees.slice(start, end);
    this.dataSource = new MatTableDataSource<any>(part);
  }

  submit() {
    this.dialogRef.close(this.elementsSelected);
  }

  close(): void {
    this.dialogRef.close();
  }

  selectElement(checking, elementSelected) {
    const index = this.existingEmployees.findIndex(e => e._id === elementSelected._id);
    this.existingEmployees[index].selected = (checking) ? true : false;
    this.elementSelected = (checking) ? elementSelected : null;
    if (checking) this.elementsSelected.push(elementSelected)
    else this.elementsSelected = this.elementsSelected.filter(e => e._id !== elementSelected._id)
  }

  unselectElement(elemento) {
    const index = this.existingEmployees.findIndex(e => e._id === elemento._id);
    this.existingEmployees[index].selected = false;
    this.elementsSelected = this.elementsSelected.filter(e => e._id !== elemento._id)
    if (!this.multiple) this.elementSelected = null;

  }

  isSelected(selected): boolean {
    const index = this.existingEmployees.findIndex(e => e._id === selected._id);
    return this.existingEmployees[index].selected;
  }

  formatContent(text: string): string {
    if (text.length <= 110) return text;
    const limit = text.substr(0, 110).lastIndexOf(' ');
    return `  ${text.substr(0, limit)}... `;
  }

  textToggle(elementToggle) {
    elementToggle.isTextToggled = !elementToggle.isTextToggled;
  }

}