import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { SelectionApiService } from '../../services/selection.api.services';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { OfferModalComponent } from '../../components/offers-list-announcement/offer-modal/offer-modal.component';
import { Employee } from '../../../shared/models/employee.model';
import { Candidature } from '../../interfaces/candidature';
import { UserService } from '../../../shared/services/user.service';
import { LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';


@Component({
  selector: 'app-nominations',
  templateUrl: './nominations.component.html'
})
export class NominationsComponent implements OnInit {
  tsLiterals: any;
  // offers: [];
  offers;
  total;
  user: Employee;
  page = 0;
  employeeHasCurriculum: boolean;
  pageSize = 10;
  search = '';
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'status', 'actions'];
  searchResultsView = false;
  existingPositions = [];
  candidatures;
  private translationsKeys: Array<string>;
  private translations: LogsMessagesOffers;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private api: SelectionApiService,
    private translate: TranslateService,
    private userService: UserService,
    private logsService: LogsService
    ) {
    this.user = this.userService.getUser();
    this.getCurriculumUserLogged();
    this.translate.get('selectionAdmin.announcements.list.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated; // no se usa??
    });
  }

  ngOnInit() {
    this.getCandidaturesByEmployeeAndUpdate();
    this.translationsKeys = [
      'modalTranslations.offers.revokeTitle',
      'modalTranslations.offers.revokeBody',
      'logsMessages.nominations.revokeSuccess',
      'logsMessages.nominations.revokeError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers ) => {
        this.translations = translations;
      });
  }

  getCandidaturesByEmployeeAndUpdate() {
    this.api.getCandidaturesByEmployee(this.user.id).subscribe(res => {
      if (res) {
        this.offers = res;
        this.prepareTable(this.offers);
      }
    });
  }

  getCurriculumUserLogged() {
    this.api.getCurriculum(this.user.id).subscribe(cv => {
      this.employeeHasCurriculum = (cv) ? true : false;
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

  prepareTable(offers) {
    this.dataSource = new MatTableDataSource<any>(offers);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
  }


  openOfferModal(candidature: Candidature) {
    this.dialog.open(OfferModalComponent, {
      data: { offer: candidature.offer, detailsMode: true, employeeHasCurriculum: this.employeeHasCurriculum }
    });
  }

  payFees(announcement) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: 'Pagar tasas', message: 'Pagar...' }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        // DO SOMETHING
      }
    });
  }

  offerClosed(candidature: Candidature) {
    const utc = new Date().toJSON().slice(0, 10);
    return candidature.offer.finishAt < utc; // cambio mayor que para que tenga sentido el nombre de la función
  }

  deApplyCandidature(candidature: Candidature) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.revokeTitle'], message: this.translations['modalTranslations.offers.revokeBody'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.api.deApplyOffer(candidature.offer._id).subscribe(
          (data: any) => {
            if (data) {
              this.getCandidaturesByEmployeeAndUpdate();
              this.logsService.log(this.translations['logsMessages.nominations.revokeSuccess']);
            }
          },
          () => this.logsService.logError(this.translations['logsMessages.nominations.revokeError'])
        );
      }
    });
  }

}
