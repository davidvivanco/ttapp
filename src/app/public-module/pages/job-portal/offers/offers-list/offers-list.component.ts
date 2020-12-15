import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomDataSource } from 'src/app/selection-module/components/custom-data-source/custom-data-source';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { ModalTranslationsAccess, ModalTranslationsSearch } from '../../../models/jobWebsiteTranslation.interface';
import { AccessModalComponent } from '../../modals/access-modal/access-modal.component';
import { OfferModalComponent } from '../../modals/offer-modal/offer-modal.component';
import { SearchPortalModalComponent } from '../../modals/search-portal-modal/search-portal-modal.component';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.scss']
})
export class OffersListComponent implements OnInit, AfterViewInit {
  page = 0;
  pageSize = 10;
  search = '';
  announcementReceived: any;
  availableSortBy = [
    { id: 1, name: '' },
    { id: 2, name: '' },
    { id: 3, name: '' },
    { id: 4, name: '' },
    { id: 5, name: '' },
    { id: 6, name: '' },
    { id: 7, name: '' },
    { id: 8, name: '' }
  ];
  selectedSort: number;
  sortField: string;
  sortOrder: string;
  idAnnouncement: string;

  public dataSource: CustomDataSource;
  displayedColumns: string[] = ['name', 'status', 'actions'];
  existingPositions = [];

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: ModalTranslationsAccess & ModalTranslationsSearch;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input()
  set announcement(announcement: any) {
    if (announcement) this.announcementReceived = announcement;
  }

  @Input()
  set idAnnouncementSend(idAnnouncementSend: any) {
    if (idAnnouncementSend) this.idAnnouncement = idAnnouncementSend;
  }

  constructor(
    private api: SelectionApiService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.announcementReceived = { title: '' };
  }

  ngOnInit() {
    this.prepareTable();
    this.logsMessagesKeys = [
      'jobWebsite.searchPortalModal.searchOffers.title',
      'jobWebsite.accessModal.title',
      'jobWebsite.accessModal.message',
      'jobWebsite.selectOrder.recentlyInitDate',
      'jobWebsite.selectOrder.oldInitDate',
      'jobWebsite.selectOrder.nextExpiration',
      'jobWebsite.selectOrder.oldExpiration',
      'jobWebsite.selectOrder.salary',
      'jobWebsite.selectOrder.vacancies',
      'jobWebsite.selectOrder.state',
      'jobWebsite.selectOrder.portalCategory',
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: ModalTranslationsAccess & ModalTranslationsSearch) => {
        this.logsMessagesTranslations = translations;
        this.createSelectArray();
      });
  }

  createSelectArray() {
    this.availableSortBy[0].name = this.logsMessagesTranslations['jobWebsite.selectOrder.recentlyInitDate'];
    this.availableSortBy[1].name = this.logsMessagesTranslations['jobWebsite.selectOrder.oldInitDate'];
    this.availableSortBy[2].name = this.logsMessagesTranslations['jobWebsite.selectOrder.nextExpiration'];
    this.availableSortBy[3].name = this.logsMessagesTranslations['jobWebsite.selectOrder.oldExpiration'];
    this.availableSortBy[4].name = this.logsMessagesTranslations['jobWebsite.selectOrder.salary'];
    this.availableSortBy[5].name = this.logsMessagesTranslations['jobWebsite.selectOrder.vacancies'];
    this.availableSortBy[6].name = this.logsMessagesTranslations['jobWebsite.selectOrder.state'];
    this.availableSortBy[7].name = this.logsMessagesTranslations['jobWebsite.selectOrder.portalCategory'];
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadOffers(true);
        })
      )
      .subscribe();
  }

  backToAll() {
    this.search = null;
    let offersContainer = [];
    if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
    this.loadOffers(false, offersContainer);
  }

  loadOffers(loaderActive: boolean, offersContainer: Array<string> = []) {
    this.dataSource.load({
      apiFunction: 'getPublicOffersByVisibility',
      search: this.search || '',
      page: this.paginator ? this.paginator.pageIndex : 0,
      rowsPerPage: this.paginator ? this.paginator.pageSize : 10,
      sort: this.sortField,
      sortOrder: this.sortOrder,
      loaderActive,
      idContainer: offersContainer
    });
  }

  prepareTable() {
    let offersContainer = [];
    if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getPublicOffersByVisibility',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true,
      idContainer: offersContainer
    });
  }

  openSearchModal() {
    const dialog = this.dialog.open(SearchPortalModalComponent, {
      width: '900px',
      data: { title: this.logsMessagesTranslations['jobWebsite.searchPortalModal.searchOffers.title'] }
    });

    dialog.afterClosed().subscribe(search => {
      if (search) {
        this.paginator.pageIndex = 0;
        this.search = search;
        let offersContainer = [];
        if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
        this.loadOffers(false, offersContainer);
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
        this.sortField = 'salary';
        this.sortOrder = 'asc';
        break;
      case 6:
        this.sortField = 'vacancies';
        this.sortOrder = 'asc';
        break;
      case 7:
        this.sortField = 'state';
        this.sortOrder = 'asc';
        break;
      case 8:
        this.sortField = 'category';
        this.sortOrder = 'asc';
        break;
      default:
        break;
    }
    this.paginator.pageIndex = 0;
    let offersContainer = [];
    if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
    this.loadOffers(false, offersContainer);
  }

  goBack() {
    this.router.navigate(['/public/portal-de-empleo/convocatorias'], { relativeTo: this.route });
  }

  openOfferModal(offer) {
    this.dialog.open(OfferModalComponent, {
      data: { offer }
    });
  }

  applyOffer() {
    this.dialog.open(AccessModalComponent, {
      data: {
        title: this.logsMessagesTranslations['jobWebsite.accessModal.title'],
        message: this.logsMessagesTranslations['jobWebsite.accessModal.message']
      }
    });
  }

}
