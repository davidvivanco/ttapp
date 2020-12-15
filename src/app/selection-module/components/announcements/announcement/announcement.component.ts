import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CanDeactivate, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SelectionApiService } from '../../../services/selection.api.services';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { Announcement } from 'src/app/shared/models/announcement.model';
import { LinkOffersModalComponent } from './modals/link-offers-modal/link-offers-modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';
import { MY_FORMATS } from 'src/app/globals';
import { VisibilityType } from 'src/app/shared/types/selection';


@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AnnouncementComponent {

  announcementReceived: Announcement;

  announcementIsPublished: boolean;
  dataAnnouncement: Announcement;
  formGroup: FormGroup;
  disabledAnnouncement: boolean;
  disabled: boolean;
  edit: boolean;
  unSavedChanges: boolean;
  disabledFees: boolean;
  notValidToSave: boolean;
  idAnnouncement: string;
  page: string;
  minDate;
  maxDate;
  tsLiterals: any;


  @Input()
  set announcement(announcement: Announcement) {
    if (announcement) {
      this.announcementReceived = announcement;
      this.createForm(announcement);
    }
  }

  @Input()
  set validators(state: string) {
    if (state) {
      this.changeValidators(state);
    }
  }


  @Output() changePage = new EventEmitter<string>();
  @Output() emitAnnouncement: EventEmitter<Announcement> = new EventEmitter<Announcement>();
  @Output() thereIsChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private _location: Location,
    private translate: TranslateService,
    private api: SelectionApiService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private logsService: LogsService,
    private dateAdapter: DateAdapter<Date>) {

    this.disabledFees = true;
    this.notValidToSave = true;
    this.disabledAnnouncement = true;
    this.page = 'home';
    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
      this.disabled = this.router.getCurrentNavigation().extras.state.data.disabled;
      this.edit = this.router.getCurrentNavigation().extras.state.data.edit;
    }
    this.translate.get('selectionAdmin.announcements.form.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });

    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }



  drop(event: CdkDragDrop<string[]>) {
    if (!this.disabled) moveItemInArray(this.announcement.offers, event.previousIndex, event.currentIndex);
  }

  createForm(data?): void {
    if (data) {
      if (!data.offers) data.offers = [];
      else this.edit = true;
    }

    this.enableSaveButton(data.title);

    this.announcementIsPublished = data && data.state === 'published';

    this.formGroup = this.formBuilder.group({
      title: [data.title, [Validators.required]],
      category: [data.category, this.announcementIsPublished ? [Validators.required] : []],
      visibility: [data.visibility, this.announcementIsPublished ? [Validators.required] : []],
      startsAt: [data.startsAt, this.announcementIsPublished ? [Validators.required] : []],
      finishAt: [data.finishAt, this.announcementIsPublished ? [Validators.required] : []],
      description: [data.description, this.announcementIsPublished ? [Validators.required] : []],
      totalVacancies: [data.offers.reduce((prev, cur) => prev + cur.vacancies, 0)]
    });

    this.formGroup.valueChanges.subscribe(() => {
      this.edit = false;
      this.controlLimits();
      this.thereIsChanges.emit(true);
      this.unSavedChanges = true;
    });
  }



  changeValidators(state) {
    const controls = ['category', 'visibility', 'startsAt', 'finishAt', 'description'];
    if (state === 'published') {
      this.announcementIsPublished = true;
      controls.forEach(control => {
        this.formGroup.controls[control].setValidators([Validators.required]);
      });
    } else {
      this.announcementIsPublished = false;

      controls.forEach(control => {
        this.formGroup.controls[control].clearValidators();
      });
    }
  }

  openModalAddOffer() {
    this.dialog.open(LinkOffersModalComponent,
      {
        width: '900px',
        data: {
          offersInAnnouncement: this.announcementReceived.offers.map(o => o._id),
          titleModal: this.tsLiterals.addOffersToAnnouncement,
          visibility: this.announcementReceived.visibility
        },
        autoFocus: false
      }).afterClosed().subscribe(res => {
        if (res) {
          if (!res.canceling) {
            this.announcementReceived.offers = [...this.announcementReceived.offers, ...res.offers];
            this.updateTotalVacancies();
            this.thereIsChanges.emit(true);
            this.unSavedChanges = true;
          }
        }
      });
  }

  enableSaveButton(value) {
    this.notValidToSave = !value.length;
  }

  editAnnouncement() {

    const jsonSend = {};
    Object.keys(this.formGroup.value).forEach(key => {
      if (this.formGroup.value[key] != null) {
        jsonSend[key] = this.formGroup.value[key];
      }
    });


    const offerIds = [];
    this.announcementReceived.offers.forEach((offer: any) => {
      offerIds.push(offer._id);
    });

    jsonSend['offers'] = offerIds;

    if (this.announcementReceived._id !== undefined) {
      this.api.saveAnnouncement(this.announcementReceived._id, jsonSend).subscribe(
        (res: { announcement: Announcement }) => {
          if (res.announcement) {
            this.logsService.log(this.tsLiterals.announcementSaved);
            this.edit = true;
            this.thereIsChanges.emit(false);
            this.unSavedChanges = false;
            this.emitAnnouncement.emit(res.announcement);
          }
        },
        () => this.logsService.logError(this.tsLiterals.errorSaving)
      );
    } else {
      this.api.addNewAnnouncement(jsonSend).subscribe(
        (res: { announcement: Announcement }) => {
          if (res.announcement) {
            this.announcementReceived = res.announcement;
            this.logsService.log(this.tsLiterals.announcementSaved);
            this.edit = true;
            this.thereIsChanges.emit(false);
            this.unSavedChanges = false;
            this.emitAnnouncement.emit(res.announcement);

          }
        },
        () => this.logsService.logError(this.tsLiterals.errorSaving)
      );
    }

  }


  deleteOffer(offer, index) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.dropOffer, message: this.tsLiterals.areYouSure }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.announcementReceived.offers.splice(index, 1);
        this.updateTotalVacancies();
        this.thereIsChanges.emit(true);
        this.unSavedChanges = true;

      }
    });
  }


  addOffer() {
    this.changePage.emit('addOffer');
  }

  editOffer(offer, index) {
    this.router.navigateByUrl(`/seleccion/admin/ofertas/edit/${offer._id}`);
  }

  updateTotalVacancies() {
    this.formGroup.controls['totalVacancies'].setValue(this.announcementReceived.offers.reduce((prev, cur) => prev + cur.vacancies, 0));
  }

  setValue(index, date) {
    if (index === 0) {
      let dateMin = new Date(date.value);
      //Le sumo 1 al dia, porque en el date de Material, el primer dia del mes es 0
      dateMin.setDate(dateMin.getDate() + 1);
      this.minDate = dateMin;
    } else if (index === 1) {
      let dateMax = new Date(date.value);
      //Le resto 1 al dia, porque en el date de Material
      dateMax.setDate(dateMax.getDate() - 1);
      this.maxDate = dateMax;
    }
  }

  controlLimits() {
    const announcementStartDate = new Date(this.formGroup.value['startsAt']);
    const announcementFinishDate = new Date(this.formGroup.value['finishAt']);

    let modalMessage = '';
    for (let offer of this.announcementReceived.offers) {
      const offerStartDate = new Date(offer.startsAt);
      const offerFinishDate = new Date(offer.finishAt);

      if (offer.startsAt && typeof offer.startsAt !== 'undefined' && this.formGroup.value['startsAt'] && typeof this.formGroup.value['startsAt'] !== 'undefined' && offerStartDate < announcementStartDate) {
        offer.startsAt = this.announcementReceived.startsAt;
        modalMessage += this.tsLiterals.publishDateModified + ' ' + offer.title + '.\n';
      }
      if (offer.finishAt && typeof offer.finishAt !== 'undefined' && this.formGroup.value['finishAt'] && typeof this.formGroup.value['finishAt'] !== 'undefined' && offerFinishDate > announcementFinishDate) {
        offer.finishAt = this.announcementReceived.finishAt;
        modalMessage += this.tsLiterals.finishDateModified + ' ' + offer.title + '.\n';
      }
      if (offer.visibility != this.formGroup.value['visibility']) {
        offer.visibility = this.announcementReceived.visibility as VisibilityType;
        modalMessage += this.tsLiterals.visibilityModified + ' ' + offer.title + '.\n';
      }
    }

    if (modalMessage !== '') {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.changesInOffers, message: modalMessage + '\n' + this.tsLiterals.areYouSure }, autoFocus: false });
      dialog.afterClosed().subscribe(res => {
        // if (res) { sonarqube warning. Se pretende que haga algo después en un futuro?
        // }
      });
    }
  }

  markAsTouched() {
    Object.values(this.formGroup.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  cancel() {
    if (this.unSavedChanges) {
      this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.tsLiterals.changesInOffers, message: '¿Quiere continuar?' } })
        .afterClosed().subscribe(cancel => {
          if (cancel) {
            this.goBack();
          }
        });
    } else {
      this.goBack();
    }
  }

  goBack() {
    this._location.back();
  }
}
