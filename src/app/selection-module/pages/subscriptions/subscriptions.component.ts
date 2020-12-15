import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import localePy from '@angular/common/locales/es-PY';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../shared/services/user.service';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl, } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription as SubscriptionInterface, SearchParameters } from '../../interfaces/subscription';
import { CustomDataSource } from '../../components/custom-data-source/custom-data-source';
import { SelectionApiService } from '../../services/selection.api.services';
import { registerLocaleData } from '@angular/common';
import { merge, Subscription } from 'rxjs';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { tap } from 'rxjs/operators';
import { AddSubscriptionComponent } from './modals/add-subscription/add-subscription.component';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { VisibilityType } from '../../../shared/types/selection';
import { Notification } from '../../../shared/models/notifications.interface';
import { EventService } from '../../../shared/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit, OnDestroy, AfterViewInit {

  public dataSource: CustomDataSource;
  public displayedColumns: string[] = ['name', 'actions'];
  public search = '';
  public notificationsUnreaded: Array<Notification>;
  private page = 0;
  private pageSize = 10;
  // Custom Filter Predicate
  globalFilter = new FormControl('');
  paginatedSubscriptions: any;
  public subscriptionSubscription: Subscription;
  selects: any;
  employeeHasCurriculum: boolean;
  private private: string;
  private public: string;
  private job: string;
  private mobility: string;
  private readonly logsMessagesKeys: Array<string> = [
    'genericMessages.private',
    'genericMessages.public',
    'genericMessages.job',
    'genericMessages.mobility',
    'logsMessages.common.actionCantBeUndone',
    'logsMessages.common.deleteAnyway',

  ];
  private translations: LogsMessagesCommon;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    public sanitizer: DomSanitizer,
    public apiService: ApiService,
    public userService: UserService,
    public eventService: EventService,
    public dialog: MatDialog,
    private api: SelectionApiService,
    private translate: TranslateService,
    private router: Router
  ) {

    this.getLogsTranslations();
    this.getNotificationsUnreaded();
    registerLocaleData(localePy, 'es');
  }

  ngOnInit() {
    const notificationSubscription = this.eventService.notification.subscribe((notificationData) => {
      this.getNotificationsUnreaded();
    });
    this.eventService.setSubscription(notificationSubscription);
    this.prepareTable();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.loadSubscriptions(false);
        }
      );
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadSubscriptions(true);
        })
      )
      .subscribe();
  }

  getNotificationsUnreaded() {
    this.api.getNotificationsUnreaded().subscribe(notifications => {
      this.notificationsUnreaded = notifications;
    });
  }

  loadSubscriptions(loaderActive) {
    this.dataSource.load({
      apiFunction: 'getSubscriptions',
      search: this.search || '',
      page: this.paginator ? this.paginator.pageIndex : 0,
      rowsPerPage: this.paginator ? this.paginator.pageSize : 10,
      sort: this.sort ? this.sort.active : 'finishAt',
      sortOrder: this.sort ? this.sort.direction : 'asc',
      loaderActive
    });
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.mobility = translations['genericMessages.mobility'];
        this.job = translations['genericMessages.job'];
        this.translations = translations;
      });
  }


  transformType(typeArr: Array<VisibilityType>): string {
    let type = '';
    const lastIndex = typeArr.length - 1;
    typeArr.sort();
    typeArr.forEach((v, i, arr) => {
      switch (v) {
        case 'mobility':
          type += this.mobility;
          break;
        case 'job':
          type += this.job;
          break;
        case 'public':
          type += this.public;
          break;
        case 'private':
          type += this.private;
          break;

        default:
          break;
      }

      if (i !== lastIndex) type += ' , ';
    });

    return type;
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.subscriptionSubscription) {
      this.subscriptionSubscription.unsubscribe();
    }
  }

  addSubscription(subscription?: SubscriptionInterface) {
    this.dialog.open(AddSubscriptionComponent, {
      width: '900px',
      data: { subscription, subscriptions: this.dataSource.data, titleModal: 'dasd', selects: this.selects }, autoFocus: false
    }).afterClosed().subscribe((res: { type: Array<VisibilityType>, position: string, canceling: boolean }) => {
      if (res) {
        if (!res.canceling) {
          const searchParameters: Partial<SearchParameters> = {
            offerType: res.type,
            position: res.position
          };
          this.api.addSubscribtion(searchParameters).subscribe((subscription2: SubscriptionInterface) => {
            this.loadSubscriptions(false);
          });
        }
      }
    });
  }

  editSubscription(subscription: SubscriptionInterface) {
    this.addSubscription(subscription);
  }

  thereIsNewNotifications(positionId: string): boolean {
    return (this.notificationsUnreaded
      .filter(n => n.type === 'custom-subscription' && n.params.find(p => p.positionId === positionId)))
      .length >= 1;
  }

  deleteSubscription(subscriptionId: string) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['logsMessages.common.actionCantBeUndone'], message: this.translations['logsMessages.common.deleteAnyway'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.api.removeSubscribtion(subscriptionId).subscribe(subscription => {
          this.loadSubscriptions(false);
        });
      }
    });
  }

  seeOffers(element) {
    let visibilityParams = '';
    const offerType = element.searchParameters.offerType;
    if (offerType.length) {
      offerType.forEach(offer => {
        visibilityParams += `&visibility=${offer}`;
      });
    }
    const url = `seleccion/ofertas`;
    this.router.navigate([url], { queryParams: { positionId: element.searchParameters.position._id, visibility: offerType } });
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.api);
    this.dataSource.load({
      apiFunction: 'getSubscriptions',
      search: this.search,
      page: this.page,
      rowsPerPage: this.pageSize,
      sort: 'finishAt',
      sortOrder: 'asc',
      loaderActive: true
    });
  }

}
