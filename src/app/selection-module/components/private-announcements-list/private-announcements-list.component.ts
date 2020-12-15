import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import localePy from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../shared/services/user.service';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SelectionApiService } from '../../services/selection.api.services';
import { Router, ActivatedRoute } from '@angular/router';
import { AnnouncementModalComponent } from './announcement-modal/announcement-modal.component';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomDataSource } from '../custom-data-source/custom-data-source';
import { Employee } from 'src/app/shared/models/employee.model';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { Announcement } from 'src/app/shared/models/announcement.model';

@Component({
  selector: 'app-private-announcements-list',
  templateUrl: './private-announcements-list.component.html'
})
export class PrivateAnnouncementsListComponent implements OnInit, OnDestroy, AfterViewInit {

  public announcements: [];
  public dataSource: CustomDataSource;
  public displayedColumns: string[] = ['name', 'status', 'actions'];
  public search = '';
  public announcementSubscription: Subscription;
  private page = 0;
  private pageSize = 10;
  private readonly logsMessagesKeys: Array<string> = [
    'genericMessages.private',
    'genericMessages.noData',
    'genericMessages.public',
    'genericMessages.job',
    'genericMessages.mobility',

  ];

  private: string;
  public: string;
  job: string;
  mobility: string;
  noData: string;
  private translations: LogsMessagesCommon;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');
  visibility = new FormControl('');

  user: Employee;

  constructor(
    public sanitizer: DomSanitizer,
    public apiService: ApiService,
    public userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private translate: TranslateService
  ) {
    registerLocaleData(localePy, 'es');
    this.getLogsTranslations();
  }

  filterByVisibility(visibility) {
    this.loadAnnouncements(true, visibility);
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.prepareTable();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.loadAnnouncements(false);
        }
      );
    this.visibility.valueChanges
      .subscribe(
        str => {
          this.search = this.globalFilter.value.trim();
          this.paginator.pageIndex = 0;
          this.loadAnnouncements(false);
        }
      );
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadAnnouncements(true);
        })
      )
      .subscribe();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.mobility = translations['genericMessages.mobility'];
        this.job = translations['genericMessages.job'];
        this.noData = translations['genericMessages.noData'];
        this.translations = translations;
      })
  }

  loadAnnouncements(loaderActive: boolean, visibility?: string) {
    this.dataSource.load(
      {
        apiFunction: 'getAnnouncementsByVisibility',
        search: this.search,
        page: this.paginator.pageIndex,
        rowsPerPage: this.paginator.pageSize,
        sort: this.sort.active,
        sortOrder: this.sort.direction,
        loaderActive,
        visibility
      });
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.announcementSubscription) {
      this.announcementSubscription.unsubscribe();
    }
  }


  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  announcementClosed(announcement: Announcement) {
    const utc = new Date().toJSON().slice(0, 10);
    const parseDate = new Date(announcement.finishAt).toJSON().slice(0, 10);
    return parseDate < utc;
  }

  openAnnouncementModal(announcement) {
    const dialog = this.dialog.open(AnnouncementModalComponent, {
      width: '900px',
      data: { announcement }
    });

    dialog.afterClosed().subscribe(data => {
      // DO SOMETHING
    });
  }

  viewOffers(element, disabled, edit = false) {
    this.router.navigate([element._id], { relativeTo: this.route, state: { data: {} } });
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getAnnouncementsByVisibility',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true
    });
  }

  seeOffers(element) {
    this.router.navigate(['ofertas/' + element._id], { relativeTo: this.route });
  }


}
