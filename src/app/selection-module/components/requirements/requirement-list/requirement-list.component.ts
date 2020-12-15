import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { UserService } from 'src/app/shared//services/user.service';
import { Permissions } from 'src/app/shared/models/permissions.model';
import { FormControl } from '@angular/forms';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { LogsMessagesCommon, LogsMessagesCompetence } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Requirement } from '../../../interfaces/requirement';
import { CustomDataSource } from '../../custom-data-source/custom-data-source';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-requirement-list',
  templateUrl: './requirement-list.component.html'
})
export class RequirementListComponent implements OnInit, OnDestroy, AfterViewInit {

  public requirementSubscription: Subscription;

  permissions: Permissions;
  loading = false;
  public dataSource: CustomDataSource;
  public displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  availableGroups = [];
  existingScales: any;
  private logsMessagesKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private logsMessagesTranslations: LogsMessagesCommon & LogsMessagesCompetence;
  public search = '';
  private page;
  private pageSize;

  globalFilter = new FormControl('');

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  @Input() user;
  @Input() requirements;

  // Custom Filter Predicate

  constructor(
    private userService: UserService,
    private api: SelectionApiService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private logsService: LogsService,
    private translate: TranslateService
  ) {
  }
  ngOnInit() {
    this.pageSize = 5;
    this.page = 0;
    this.getData();
    this.logsMessagesKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.actionSuccess',
      'logsMessages.selection.assessment.deleteAssessment',
      'logsMessages.common.changesNoSaved',
      'logsMessages.common.deleteAnyway',
      'modalTranslations.common.deleteMessage'
    ];

    this.getLogsTranslations();
    this.permissions = this.userService.getPermissions();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.getRequirementList(false);
        }
      );
  }


  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.getRequirementList(true);
        })
      )
      .subscribe();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesCompetence) => {
        this.logsMessagesTranslations = translations;
      });
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
  }

  handleSuccess() {
    this.getRequirementList(false);
    this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
  }

  getRequirementList(loaderActive) {
    this.dataSource.load(
      {
        apiFunction: 'getRequirements',
        search: this.search || '',
        page: this.paginator ? this.paginator.pageIndex : 0,
        rowsPerPage: this.paginator.pageSize,
        sort: this.sort ? this.sort.active : 'createdAt',
        sortOrder: this.sort ? this.sort.direction : 'asc',
        loaderActive
      });
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.requirementSubscription) {
      this.requirementSubscription.unsubscribe();
    }
  }

  delete(requirement: Requirement, i: number): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data:
      {
        message: this.logsMessagesTranslations['modalTranslations.common.deleteMessage'],
        title: this.logsMessagesTranslations['logsMessages.selection.assessment.deleteAssessment']

      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.api.deleteOneRequirement(requirement._id).subscribe(
          res => {
            this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);

            this.getData();
          }
        );
      }
    });
  }


  editElement(element, disabled, edit = false) {
    this.router.navigate([element._id], { relativeTo: this.route, state: { data: { disabled: disabled, edit: edit } } });
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description + ' ';
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  getData() {
    this.api.getRequirements({}).subscribe(
      (data: any) => {
        if (data) {
          this.requirements = data;
          this.prepareTable();
        }

      },
      () => console.log('error')
    );
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getRequirements',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'createdAt',
      sortOrder: 'asc',
      loaderActive: true
    });
  }
}
