import { SelectionApiService } from '../../services/selection.api.services';
import { Component, OnInit, ViewChild, Input, OnDestroy, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import localePy from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../shared/services/user.service';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { CustomDataSource } from '../custom-data-source/custom-data-source';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';


import { Router, ActivatedRoute } from '@angular/router';
import { OfferModalComponent } from './offer-modal/offer-modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';
import { LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { Subscription, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Offer } from '../../interfaces/offer';
import { VisibilityType } from 'src/app/shared/types/selection';
import { Employee } from 'src/app/shared/models/employee.model';
import { utc } from 'moment';
import { Announcement } from '../../../shared/models/announcement.model';

@Component({
  selector: 'app-offers-list-announcement',
  templateUrl: './offers-list-announcement.component.html',
  styleUrls: ['./offers-list-announcement.component.scss']
})
export class OffersListAnnouncementComponent implements OnInit, OnDestroy, AfterViewInit {

  offers: [];
  page = 0;
  pageSize = 10;
  search = '';
  announcementReceived: any;

  // Traducciones
  private: string;
  public: string;
  job: string;
  mobility: string;
  noData: string;
  private translationsKeys: Array<string>;
  private translations: LogsMessagesOffers & ModalTranslationsOffers;

  public offersSubscription: Subscription;


  public dataSource: CustomDataSource;
  displayedColumns: string[] = ['name', 'status', 'actions'];
  searchResultsView = false;
  existingPositions = [];
  user: Employee;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');
  positionId: string;
  visibilityAux: string[];
  @Input() employeeHasCurriculum: boolean;

  @Input()
  set announcement(announcement: any) {
    if (announcement) {
      this.announcementReceived = announcement;
    } else {
      console.warn('no he recibido convocatoria');
    }
  }

  @Output() fromSubscription = new EventEmitter<boolean>();

  constructor(
    private api: SelectionApiService,
    public sanitizer: DomSanitizer,
    public apiService: ApiService,
    public userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private logsService: LogsService,
    private translate: TranslateService

  ) {
    this.user = this.userService.getUser();
    registerLocaleData(localePy, 'es');
    this.announcementReceived = { title: '' };
    this.positionId = this.route.snapshot.paramMap.get('positionId');
    this.route.queryParams.subscribe(qp => {
      if (qp.positionId) this.positionId = qp.positionId;
      if (qp.visibility) this.visibilityAux = qp.visibility;
      if (qp.offerId) {
        this.api.getOfferById(qp.offerId).subscribe((offer: Offer) => {
          if (offer) this.openOfferModal(offer);
        });
      }
    });
  }

  filterByVisibility(visibility: VisibilityType) {
    this.loadOffers(true, visibility);
  }

  ngOnInit() {
    setTimeout(() => { // evitar error expressionchangedafterwaschecked
      this.checkPosition(this.positionId);
    });

    if (this.positionId) this.loadOffersWithPosition();
    if (!this.positionId) this.prepareTable();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          if (this.positionId) { // filtro de búsqueda dependiendo si es ofertas normales o con prefiltrado de posición
            this.loadOffersWithPosition();
          } else if (!this.positionId) this.loadOffers(false);

        }
      );
    this.translationsKeys = [
      'modalTranslations.offers.presentTitle',
      'modalTranslations.offers.presentBody',
      'modalTranslations.offers.revokeTitle',
      'modalTranslations.offers.revokeBody',
      'modalTranslations.offers.presentTitleSubscription',
      'modalTranslations.offers.presentBodySubscription',
      'logsMessages.offers.presentSuccess',
      'logsMessages.offers.subscribeSuccess',
      'logsMessages.offers.subscribeError',
      'logsMessages.offers.presentError',
      'logsMessages.nominations.presentSuccess',
      'logsMessages.nominations.revokeSuccess',
      'logsMessages.nominations.presentError',
      'logsMessages.nominations.revokeError',
      'genericMessages.private',
      'genericMessages.noData',
      'genericMessages.public',
      'genericMessages.job',
      'genericMessages.mobility',

    ];
    this.getTranslations();
    this.deleteQueryParams();
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

  deleteQueryParams() {
    if (this.positionId) {
      this.router.navigate(
        ['.'],
        { relativeTo: this.route, queryParams: {}, skipLocationChange: true }
      );
    }
  }

  checkPosition(position) {
    if (position) this.fromSubscription.emit(true);
  }

  offerClosed(offer: Offer) {
    const utc = new Date().toJSON().slice(0, 10);
    return offer.finishAt < utc;
  }

  loadOffers(loaderActive, visibility?: VisibilityType) {
    this.dataSource.load(
      {
        apiFunction: 'getOffersByVisibility',
        search: this.search || '',
        page: this.paginator ? this.paginator.pageIndex : 0,
        rowsPerPage: this.paginator ? this.paginator.pageSize : 10,
        sort: this.sort ? this.sort.active : 'finishAt',
        sortOrder: this.sort ? this.sort.direction : 'asc',
        loaderActive,
        visibility
      });
  }

  loadOffersWithPosition() {
    let offersContainer = [];
    if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getOffersByVisibility',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true,
      idContainer: offersContainer,
      positionId: this.positionId,
      visibility: this.visibilityAux
    }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.offersSubscription) {
      this.offersSubscription.unsubscribe();
    }
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & ModalTranslationsOffers) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.mobility = translations['genericMessages.mobility'];
        this.job = translations['genericMessages.job'];
        this.noData = translations['genericMessages.noData'];
        this.translations = translations;
      });
  }

  applyOrSubscribe(offer: Offer): string {
    return ((offer.visibility === 'mobility' || offer.visibility === 'job') && !offer.vacancies || offer.vacancies === 0) ? 'subscribe' : 'apply';
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  prepareTable() {
    let offersContainer = [];
    let aux = this.positionId ? this.visibilityAux : 'all';
    if (this.announcementReceived.offers) offersContainer = this.announcementReceived.offers.map(o => o._id);
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getOffersByVisibility',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true,
      idContainer: offersContainer
    }
    );
  }

  openOfferModal(offer) {
    const dialog = this.dialog.open(OfferModalComponent, {
      data: { offer, employeeHasCurriculum: this.employeeHasCurriculum }
    });

    const applyEvent = dialog.componentInstance.onApply.subscribe((offer2) => {
      this.applyOffer(offer2, 'presented');
    });

    const deApplyEvent = dialog.componentInstance.onDeApply.subscribe((offer3) => {
      this.deApplyOffer(offer3);
    });

    dialog.afterClosed().subscribe(data => {
      applyEvent.unsubscribe();
      deApplyEvent.unsubscribe();
    });
  }

  deApplyOffer(offer: Offer) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.revokeTitle'], message: this.translations['modalTranslations.offers.revokeBody'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.api.deApplyOffer(offer._id).subscribe(
          (data: any) => {
            if (data) {
              this.loadOffers(true);
              this.logsService.log(this.translations['logsMessages.nominations.revokeSuccess']);
              offer.applied = false;
            }
          },
          () => this.logsService.logError(this.translations['logsMessages.nominations.revokeError'])
        );
      }
    });
  }


  applyOffer(offer: Offer, state: String): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.presentTitle'], message: this.translations['modalTranslations.offers.presentBody'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.api.applyOffer(offer._id, state).subscribe(
          (data: any) => {
            if (data) {
              this.loadOffers(true);
              this.logsService.log(this.translations['logsMessages.nominations.presentSuccess']);
              offer.applied = true;
            }
          },
          () => this.logsService.logError(this.translations['logsMessages.nominations.presentError'])
        );
      }
    });
  }

}
