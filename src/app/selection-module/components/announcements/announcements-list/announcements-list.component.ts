import { Component, OnInit, ViewChild, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import localePy from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../../shared/services/user.service';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomDataSource } from '../../custom-data-source/custom-data-source';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { Announcement } from '../../../../shared/models/announcement.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { utc } from 'moment';

@Component({
  selector: 'app-announcements-list',
  templateUrl: './announcements-list.component.html',
  styleUrls: ['./announcements-list.component.scss']
})
export class AnnouncementsListComponent implements OnInit, OnDestroy, AfterViewInit {

  public announcementSubscription: Subscription;

  public dataSource: CustomDataSource;
  public displayedColumns: string[] = ['name', 'status', 'actions'];
  public search = '';
  private page = 0;
  private pageSize = 10;
  // Custom Filter Predicate
  globalFilter = new FormControl('');

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  @Input() user;
  @Input() announcements;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  private: string;
  public: string;
  job: string;
  mobility: string;
  noData: string;

  constructor(
    public sanitizer: DomSanitizer,
    public apiService: ApiService,
    public userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private logsService: LogsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private api: SelectionApiService

  ) {
    registerLocaleData(localePy, 'es');
  }

  ngOnInit() {
    this.getData();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.loadAnnouncements(false);
        }
      );
    this.translationsKeys = [
      'genericMessages.private',
      'genericMessages.noData',
      'genericMessages.mobility',
      'genericMessages.public',
      'logsMessages.announcements.announcementRevokedSuccess',
      'logsMessages.announcements.announcementPublishedSuccess',
      'logsMessages.announcements.announcementPublishError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.mobility = translations['genericMessages.mobility'];
        this.job = translations['genericMessages.job'];
        this.noData = translations['genericMessages.noData'];
        this.translations = translations;
      });
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

  loadAnnouncements(loaderActive) {
    this.dataSource.load(
      {
        apiFunction: 'getAnnouncements',
        search: this.search || '',
        page: this.paginator ? this.paginator.pageIndex : 0,
        rowsPerPage: this.paginator ? this.paginator.pageSize : 10,
        sort: this.sort ? this.sort.active : 'finishAt',
        sortOrder: this.sort ? this.sort.direction : 'asc',
        loaderActive
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
    return parseDate > utc;
  }

  seeOffers(announcement: Announcement) {
    this.router.navigateByUrl(`/seleccion/admin/ofertas?announcementId=${announcement._id}`);
  }

  editElement(element, disabled, edit = false) {
    this.router.navigateByUrl(`/seleccion/admin/convocatorias/edit/${element._id}`, { state: { data: { disabled: disabled, edit: edit } } });
  }

  getData() {
    this.api.getAnnouncements({}).subscribe(
      (data: any) => {
        if (data) {
          this.announcements = data;
          this.prepareTable();
        }
        //
      });
  }

  changeStateAnnouncement(announcement: Announcement, state) {
    let jsonSend = { state };

    this.api.saveAnnouncement(announcement._id, jsonSend).subscribe(
      (data: any) => {
        if (data) {
          this.logsService.log((state === 'cancelled')
            ? this.translations['modalTranslations.announcements.announcementRevokedSuccess']
            : this.translations['modalTranslations.announcements.announcementPublishedSuccess']);
          announcement.state = data.announcement.state;
        }

      },
      () => this.logsService.logError(this.translations['logsMessages.announcements.announcementPublishError'])
    );
  }


  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getAnnouncements',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true
    });
  }

}
