import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { RolModalComponent } from './rol-modal/rol-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmationModalComponent } from '../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { FormControl } from '@angular/forms';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  rolId;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  constructor(
    private apiService: ApiService, private logsService: LogsService,
    public dialog: MatDialog, private route: ActivatedRoute, private router: Router,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private translate: TranslateService,
  ) {
    this.rolId = '5d19fb3a3dc2de1b2c70deeb';
  }

  ngOnInit() {
    this._getRols();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'admin-roles', employee: user, userAgent: window.navigator.userAgent }).subscribe();

    this.translationsKeys = [
      'unitiesAdmin.tsLiterals.deleteAction',
      'modalTranslations.rol.deleteRol',
      'logsMessages.common.rolExists'
    ];
    this.getTranslations();
  }

  private _getRols(search?: string) {
    this.loading = true;
    this.apiService.getAllRols().subscribe((data) => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    });
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  openRolModal(rol?) {
    const dialog = this.dialog.open(RolModalComponent, {
      data: { rol },
      minWidth: '40%',
      width: '60%'
    });
    dialog.afterClosed().subscribe((data) => {
      let observable;

      if (!data) return;

      const isNewRol = !data._id;

      if (isNewRol && this._doesRolExists(data)) {
        return this.logsService.logError(this.translations['logsMessages.common.rolExists']);
      }

      if (data._id) {
        observable = this.apiService.updateRol(data._id, data.name, data.description, data.permissions);
      } else {
        observable = this.apiService.createRol(data.name, data.description, data.permissions);
      }

      this.loading = true;
      observable.subscribe(() => {
        this._getRols();
      });
    });
  }

  private _doesRolExists(data): boolean {
    return !!this.dataSource.data.find(item => item.name === data.name);
  }

  deleteRol(rol) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.rol.deleteRol'], message: this.translations['unitiesAdmin.tsLiterals.deleteAction'] } });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.apiService.deleteRol(rol._id).subscribe(() => {
          this._getRols();
        });
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
