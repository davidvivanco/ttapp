import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { DeleteConfirmationModalComponent } from '../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Competency } from '../../shared/models/competency.model';
import { CompetencyModalComponent } from './competency-modal/competency-modal.component';
import { Observable } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { Permissions } from '../../shared/models/permissions.model';
import { FormControl } from '@angular/forms';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { LogsMessagesCommon, LogsMessagesCompetence } from '../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-competency',
  templateUrl: './competency.component.html',
  styleUrls: ['./competency.component.scss']
})
export class CompetencyComponent implements OnInit {
  permissions: Permissions;
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  // displayedColumns: string[] = ['name', 'group', 'description', 'level', 'actions'];
  displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  availableGroups = [];
  existingCompetencies: any;
  private logsMessagesKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private logsMessagesTranslations: LogsMessagesCommon & LogsMessagesCompetence;


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
      'logsMessages.competence.competenceExists',
      'logsMessages.competence.deleteCompetence',
    ];
    this.getLogsTranslations();
    this.getCompetencies();
    this.permissions = this.userService.getPermissions();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'admin-compentencies', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesCompetence) => {
        this.logsMessagesTranslations = translations;
      });
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
  }

  handleSuccess() {
    this.getCompetencies();
    this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
  }

  openCompetencyModal(competency: Competency) {
    const dialog = this.dialog.open(CompetencyModalComponent, {
      data: { competency: competency, availableGroups: this.availableGroups }
    });

    dialog.afterClosed().subscribe(competency2 => {
      if (competency2) {
        const found = this.existingCompetencies.find(x => x.name.trim() === competency2.name.trim());
        let observable: Observable<any>;
        const isNew = !competency2._id;
        if (isNew) {
          if (found) {
            this.logsService.logError(this.logsMessagesTranslations['logsMessages.competence.competenceExists']);
            return;
          } else {
            observable = this.apiService.createCompetency(competency2)
          }
        } else {
          if (found && found._id !== competency2._id) {
            this.logsService.logError(this.logsMessagesTranslations['logsMessages.competence.competenceExists']);
            return;
          } else {
            observable = this.apiService.updateCompetency(competency2._id, competency2);
          }
        }
        this.loading = true;
        observable.subscribe(() => this.handleSuccess(), this.handleError.bind(this));
      }
    });
  }

  getCompetencies() {
    this.loading = true;
    return this.apiService.getCompetencies().subscribe((competencies: Competency[]) => {
      this.existingCompetencies = competencies;
      if (competencies.length) this.setAvailableGroups(competencies);
      this.dataSource = new MatTableDataSource<Competency>(competencies);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, this.handleError.bind(this));
  }

  deleteCompetency(competency: Competency): void {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data:
      {
        title: this.logsMessagesTranslations['logsMessages.competence.deleteCompetence'],
        message: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone']
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.loading = true;
        this.apiService.deleteCompetency(competency._id).subscribe(() => this.handleSuccess(), this.handleError.bind(this));
      }
    });
  }

  setAvailableGroups(competencies) {
    this.availableGroups.length = 0;
    competencies.map((c, i) => {
      if (i === 0) this.availableGroups.push(c.group);
      else {
        const found = this.availableGroups.find(x => x === c.group);
        if (!found) this.availableGroups.push(c.group);
      }
    });
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description + ' ' + data.group + ' ' + data.level;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }
}
