import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { DeleteConfirmationModalComponent } from '../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Position } from 'src/app/shared/models/position.model';
import { PositionsModalComponent } from './positions-modal/positions-modal.component';
import { Observable } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { Permissions } from '../../shared/models/permissions.model';
import { FormControl } from '@angular/forms';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesPosition } from '../../shared/models/logsMessages.interface';

@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit {
  permissions: Permissions;
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  existingPositions = [];
  private logsMessagesKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private logsMessagesTranslations: LogsMessagesCommon & LogsMessagesPosition;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private logsService: LogsService,
    private analyticsService: AnalyticsService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.actionCantBeUndone',
      'logsMessages.position.positionExists',
      'logsMessages.positions.deletePosition'
    ];
    this.getLogsTranslations();
    this.getPositions();
    this.permissions = this.userService.getPermissions();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'admin-positions', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  getLogsTranslations(): void {

    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesPosition) => {
        this.logsMessagesTranslations = translations;
      });
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
  }

  openPositionModal(position: Position) {
    const dialog = this.dialog.open(PositionsModalComponent, {
      data: { position }
    });

    dialog.afterClosed().subscribe(position2 => {
      if (position2) {
        let observable: Observable<any>;
        const isNew = !position2._id;
        const found = this.existingPositions.find(x => x.name.trim() === position2.name.trim());
        if (isNew) {
          if (found) {
            this.logsService.logError(this.logsMessagesTranslations['logsMessages.competence.positionExists']);
            return;
          } else {
            observable = this.apiService.createPosition(position2);
          }
        } else {
          if (found && found._id !== position2._id) {
            this.logsService.logError(this.logsMessagesTranslations['logsMessages.competence.positionExists']);
            return;
          } else {
            observable = this.apiService.updatePosition(position2._id, position2);
          }
        }
        this.loading = true;
        observable.subscribe(
          this.handleSuccess.bind(this),
          this.handleError.bind(this)
        );
      }
    });
  }

  handleSuccess() {
    this.getPositions();
    this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
  }

  getPositions() {
    this.loading = true;

    return this.apiService.getPositions().subscribe((positions: Position[]) => {
      this.existingPositions = positions;
      this.dataSource = new MatTableDataSource<Position>(positions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleError.bind(this));
  }

  deletePosition(position: Position): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: this.logsMessagesTranslations['logsMessages.positions.deletePosition'],
        message: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone']
      }
    });

    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.apiService.deletePosition(position._id).subscribe(() => this.handleSuccess(), this.handleError.bind(this));
      }
    });
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }
}
