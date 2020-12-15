import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ApiService } from '../../shared/services/api.service';
import { Employee } from '../../shared/models/employee.model';
import { Permissions } from '../../shared/models/permissions.model';
import { UserService } from '../../shared/services/user.service';
import { DeleteConfirmationModalComponent } from '../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { SearchModalPositionCardsComponent } from 'src/app/search/search-modal-position-cards/search-modal-position-cards.component';
import { AdminPositionCardsModalComponent } from './modal/admin-position-cards-modal.component';
import { CardPositionModalComponent } from 'src/app/card-position/card-position-modal/card-position-modal.component';
import { CardPositionsDataSource } from 'src/app/shared/services/cardPositions.datasource';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesAdmin } from '../../shared/models/logsMessages.interface';

@Component({
  selector: 'app-admin-position-cards',
  templateUrl: './admin-position-cards.component.html',
  styleUrls: ['./admin-position-cards.component.scss']
})
export class AdminPositionCardsComponent implements OnInit, AfterViewInit {
  private page = 0;
  private pageSize = 10;
  private search: string = null;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesAdmin;

  user: Employee;
  permissions: Permissions;
  searchResultsView = false;

  dataSource: CardPositionsDataSource;
  displayedColumns: string[] = ['name', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private apiService: ApiService,
    private userService: UserService,
    private translateService: TranslateService,
    private logsService: LogsService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.admin.cardPositionCreateSuccess',
      'logsMessages.admin.cardPositionDeleteSuccess',
      'logsMessages.admin.toDeleteCardPosition',
      'logsMessages.admin.actionCanNotBeUndone',
      'logsMessages.admin.cardPositionEditSuccess',
      'logsMessages.admin.clone',
      'logsMessages.admin.cloneSuccess',
      'logsMessages.admin.cardPositonSearch',
      'logsMessages.admin.cardPositonSearchDesc'
    ];
    this.getLogsTranslations();
    this.dataSource = new CardPositionsDataSource(this.apiService);
    this.dataSource.load(this.search, this.page, this.pageSize);
    this.user = this.userService.getUser();
    this.permissions = this.userService.getPermissions();
    this.analyticsService.addAnalytics({ accessTo: 'admin-cardPositions', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
  }


  getLogsTranslations(): void {
    this.translateService.get(this.logsMessagesKeys).subscribe((translations: LogsMessagesAdmin) => {
      this.logsMessagesTranslations = translations;
    });
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadCardPositions())
      )
      .subscribe();
  }

  loadCardPositions() {
    this.dataSource.load(
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction);
  }

  createPositionCard() {
    this.dialog.open(AdminPositionCardsModalComponent, { data: { item: {}, permissions: this.permissions, action: 'add' }, autoFocus: false }).afterClosed().subscribe(res => {
      if (res) {
        this.apiService.addCardPosition(res).subscribe(() => {
          this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.cardPositionCreateSuccess']);
          this.loadCardPositions();
        });
      }
    });
  }

  showCardPosition(cardPosition) {
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition._id, title: cardPosition.name }, autoFocus: false });
  }

  editCardPosition(cardPosition, isEdit?) {
    this.dialog.open(AdminPositionCardsModalComponent, { data: { item: cardPosition, permissions: this.permissions, action: 'edit' }, autoFocus: false }).afterClosed().subscribe(res => {
      if (res) {
        this.apiService.editCardPosition(cardPosition._id, res).subscribe((res2) => {
          this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.cardPositionEditSuccess']);
          this.loadCardPositions();
        });
      }
    });
  }

  printPositionCard(cardPosition) {
    this.apiService.printCardPosition(cardPosition.id).subscribe(res => {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([res], { type: 'application/pdf' });

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const data = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = data;
      link.download = `${cardPosition.name}.pdf`;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
    });
  }

  clonePositionCards(cardPosition) {
    const clonedPositionCard = JSON.parse(JSON.stringify(cardPosition));
    ['_id', 'createdAt', 'id', 'positions'].forEach(e => delete clonedPositionCard[e]);
    clonedPositionCard.name = clonedPositionCard.name + ' ' + this.logsMessagesTranslations['logsMessages.admin.clone'];
    if (clonedPositionCard.report.id) clonedPositionCard.report = clonedPositionCard.report.id;
    this.apiService.addCardPosition(clonedPositionCard).subscribe(() => {
      this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.cloneSuccess']);
      this.loadCardPositions();
    });
  }

  deleteCardPosition(id) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.admin.toDeleteCardPosition'], message: this.logsMessagesTranslations["logsMessages.admin.actionCanNotBeUndone"] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.apiService.deleteCardPosition(id).subscribe(() => {
          this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.cardPositionDeleteSuccess']);
          this.loadCardPositions();
        });
      }
    });
  }

  searchCardPosition() {
    const title = this.logsMessagesTranslations['logsMessages.admin.cardPositonSearch'];
    const description = this.logsMessagesTranslations['logsMessages.admin.cardPositonSearchDesc'];
    const dialog = this.dialog.open(SearchModalPositionCardsComponent, { data: { title: title, description: description }, autoFocus: false });
    dialog.afterClosed().subscribe(((searchStr: string) => {
      if (searchStr) {
        this.paginator.pageIndex = 0;
        this.search = searchStr;
        this.loadCardPositions();
      }
    }));
  }

  backToAll() {
    this.search = null;
    this.loadCardPositions();
  }
}
