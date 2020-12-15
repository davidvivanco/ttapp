import { SelectionApiService } from '../../../services/selection.api.services';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import localePy from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../../shared/services/user.service';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RequirementOfferModalComponent } from './modals/requirement-modal/requirement-modal.component';
import { Permissions } from '../../../../shared/models/permissions.model';
import { CustomDataSource } from '../../custom-data-source/custom-data-source';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Offer } from 'src/app/selection-module/interfaces/offer';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { AddVacanciesModalComponent } from './modals/add-vacancies-modal/add-vacancies-modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.scss']
})
export class OffersListComponent implements OnInit, OnDestroy, AfterViewInit {

  offers: [];
  public offersSubscription: Subscription;
  dataSource: CustomDataSource;
  readonly displayedColumns: string[] = ['name', 'status', 'actions'];
  searchResultsView = false;
  existingPositions = [];
  public search = '';
  private page = 0;
  private pageSize = 10;
  private readonly logsMessagesKeys: Array<string> = [
    'genericMessages.private',
    'genericMessages.noData',
    'genericMessages.mobility',
    'genericMessages.public',
    'genericMessages.job',
    'logsMessages.common.errorOccurred',
    'logsMessages.common.actionSuccess',
    'logsMessages.common.actionCantBeUndone',
    'logsMessages.common.deleteAnyway'

  ]; // Para delete mat chips sin afectar al padre hasta que guarde
  private: string;
  public: string;
  job: string;
  mobility: string;
  noData: string;
  private translations: LogsMessagesCommon;

  permissions: Permissions;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  offersId: Array<string> = [];

  @Input()
  set offersContainerId(offersId) {
    const reloadOffers = this.offersId.length > 0;
    this.offersId = offersId;
    if (reloadOffers) this.loadOffers(true);
  }

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
    this.getLogsTranslations();
    registerLocaleData(localePy, 'es');
  }



  ngOnInit() {
    this.prepareTable();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.loadOffers(false);
        }
      );
    this.permissions = this.userService.getPermissions();

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

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.mobility = translations['genericMessages.mobility'];
        this.job = translations['genericMessages.job'];
        this.noData = translations['genericMessages.noData'];
        this.translations = translations;
      });
  }

  loadOffers(loaderActive) {
    this.dataSource.load({
      apiFunction: 'getOffers',
      search: this.search,
      page: this.paginator.pageIndex,
      rowsPerPage: this.paginator.pageSize,
      sort: this.sort.active,
      sortOrder: this.sort.direction,
      loaderActive
    });
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.offersSubscription) {
      this.offersSubscription.unsubscribe();
    }
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  editElement(offer: Offer, disabled) {
    this.router.navigate([`edit/${offer._id}`],
      {
        relativeTo: this.route,
        state: { data: { disabled: disabled } }
      });
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getOffers',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'startsAt',
      sortOrder: 'asc',
      loaderActive: true,
      idContainer: this.offersId
    });
  }

  publicOffer(offer: Offer) {
    offer.state = 'published';
    this.api.saveOffer(offer._id, offer).subscribe(
      (data: any) => {
        if (data) {
          this.logsService.log(this.translations['logsMessages.common.actionSuccess']);
        }
      },
      () => this.logsService.logError(this.translations['logsMessages.common.errorOccurred'])
    );

  }

  openRequirementModal(offer: Offer) {
    this.dialog.open(RequirementOfferModalComponent,
      {
        width: '800px',
        data:
          { requirement: offer.requirement }
      });
  }

  openVacanciesModal(offer: Offer) {
    const dialog = this.dialog.open(AddVacanciesModalComponent, { data: offer.title });

    dialog.afterClosed().subscribe(data => {
      offer.vacancies = data;
      this.api.saveOffer(offer._id, offer).subscribe(
        (data2: any) => {
          if (data2) {
            // acabar
          }

        },
        () => this.logsService.logError('Error al añadir plazas en la oferta. Por favor, inténtelo de nuevo')
      );
    });
  }

  communicateCandidates(offer: Offer) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent,
      {
        data: {
          title: 'Comunicar a todos los candidatos',
          message: offer.title + '\nVas a comunicar a todos los candidatos de esta oferta que existen plazas para que decidan si participar en el proceso o no. Esta opción no se puede deshacer, ¿estas seguro?'
        }
      });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.api.comunicateCandidates(offer._id).subscribe(subscribers => {
        });
      }
    });
  }

  cancelOffer(element) {
    element.state = 'cancelled';
    this.api.saveOffer(element._id, element).subscribe(
      (data: any) => {
        if (data) {
          this.logsService.log(this.translations['logsMessages.common.actionSuccess']);
        }

      },
      () => this.logsService.logError(this.translations['logsMessages.common.errorOccurred'])
    );
  }

  goToCandidatures(offer: Offer) {
    this.router.navigate([`../candidaturas`], { relativeTo: this.route, queryParams: { offerId: offer._id } });
  }

  offerExpired(offer: Offer) {
    const utc = new Date().toJSON().slice(0, 10);
    return offer.finishAt < utc;
  }

}
