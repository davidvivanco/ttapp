import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { CustomDataSource } from 'src/app/selection-module/components/custom-data-source/custom-data-source';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { SearchPortalModalComponent } from '../modals/search-portal-modal/search-portal-modal.component';
import { AnnouncementModalComponent } from '../modals/announcement-modal/announcement-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalTranslationsSearch, SelectOrderTranslations } from '../../models/jobWebsiteTranslation.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent implements OnInit, AfterViewInit {
  availableSortBy = [
    { id: 1, name: '' },
    { id: 2, name: '' },
    { id: 3, name: '' },
    { id: 4, name: '' },
    { id: 5, name: '' },
    { id: 6, name: '' },
    { id: 7, name: '' }
  ];
  selectedSort: number;
  sortField: string;
  sortOrder: string;
  public dataSource: CustomDataSource;
  public search: string = '';
  private page = 0;
  private pageSize = 10;
  public displayedColumns: string[] = ['name', 'status', 'actions'];

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: ModalTranslationsSearch & SelectOrderTranslations;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  globalFilter = new FormControl('');

  constructor(
    private api: SelectionApiService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.prepareTable();
    this.logsMessagesKeys = [
      'jobWebsite.searchPortalModal.searchAnnouncements.title',
      'jobWebsite.selectOrder.recentlyInitDate',
      'jobWebsite.selectOrder.oldInitDate',
      'jobWebsite.selectOrder.nextExpiration',
      'jobWebsite.selectOrder.oldExpiration',
      'jobWebsite.selectOrder.vacancies',
      'jobWebsite.selectOrder.state',
      'jobWebsite.selectOrder.portalCategory'
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: ModalTranslationsSearch & SelectOrderTranslations) => {
        this.logsMessagesTranslations = translations;
        this.createSelectArray();
      })
  }

  createSelectArray() {
    this.availableSortBy[0].name = this.logsMessagesTranslations['jobWebsite.selectOrder.recentlyInitDate'];
    this.availableSortBy[1].name = this.logsMessagesTranslations['jobWebsite.selectOrder.oldInitDate'];
    this.availableSortBy[2].name = this.logsMessagesTranslations['jobWebsite.selectOrder.nextExpiration'];
    this.availableSortBy[3].name = this.logsMessagesTranslations['jobWebsite.selectOrder.oldExpiration'];
    this.availableSortBy[4].name = this.logsMessagesTranslations['jobWebsite.selectOrder.vacancies'];
    this.availableSortBy[5].name = this.logsMessagesTranslations['jobWebsite.selectOrder.state'];
    this.availableSortBy[6].name = this.logsMessagesTranslations['jobWebsite.selectOrder.portalCategory'];
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadAnnouncements(true)
        })
      )
      .subscribe();
  }

  backToAll() {
    this.search = null;
    this.loadAnnouncements(false);
  }

  loadAnnouncements(loaderActive: boolean) {
    this.dataSource.load({
      apiFunction: 'getPublicAnnouncementsByVisibility',
      search: this.search || '',
      page: this.paginator.pageIndex,
      rowsPerPage: this.paginator.pageSize,
      sort: this.sortField,
      sortOrder: this.sortOrder,
      loaderActive
    });
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getPublicAnnouncementsByVisibility',
      search: this.search || '',
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true
    });
  }

  openAnnouncementModal(announcement) {
    this.dialog.open(AnnouncementModalComponent, {
      width: '900px',
      data: { announcement }
    });
  }

  seeOffers(element) {
    this.router.navigate(['ofertas/' + element._id], { relativeTo: this.route });
  }

  openSearchModal() {
    const dialog = this.dialog.open(SearchPortalModalComponent, {
      width: '900px',
      data: { title: this.logsMessagesTranslations['jobWebsite.searchPortalModal.searchAnnouncements.title'] }
    });

    dialog.afterClosed().subscribe(search => {
      if (search) {
        this.paginator.pageIndex = 0;
        this.search = search;
        this.loadAnnouncements(false);
      }
    });
  }

  onChangeSort(event) {
    this.selectedSort = event;
    switch (this.selectedSort) {
      case 1:
        this.sortField = 'startsAt';
        this.sortOrder = 'desc';
        break;
      case 2:
        this.sortField = 'startsAt';
        this.sortOrder = 'asc';
        break;
      case 3:
        this.sortField = 'finishAt';
        this.sortOrder = 'asc';
        break;
      case 4:
        this.sortField = 'finishAt';
        this.sortOrder = 'desc';
        break;
      case 5:
        this.sortField = 'vacancies';
        this.sortOrder = 'asc';
        break;
      case 6:
        this.sortField = 'state';
        this.sortOrder = 'asc';
        break;
      case 7:
        this.sortField = 'category';
        this.sortOrder = 'asc';
        break;
      default:
        break;
    }
    this.paginator.pageIndex = 0;
    this.loadAnnouncements(false);
  }

}
