import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SelectionApiService } from '../../../services/selection.api.services';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Offer } from '../../../../shared/models/offer.model';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { AddPhaseModalComponent } from './modals/add-phase-modal/add-phase-modal.component';
import { AddDocumentationModalComponent } from './modals/add-documentation-modal/add-documentation-modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { LinkAnnouncementModalComponent } from './modals/link-announcement-modal/link-announcement-modal.component';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ApiService } from '../../../../shared/services/api.service';
import { Announcement } from 'src/app/shared/models/announcement.model';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from '../../../../shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from '../../../../shared/models/modalTranslation.interface';
import { MY_FORMATS } from 'src/app/globals';
import { Requirement } from '../../../interfaces/requirement';
import { AddRequirementCriterionModalComponent } from './modals/add-requirement-criterion/add-requirement-criterion.component';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';
import { AddPositionModalComponent } from './modals/add-position-modal/add-position-modal.component';
import { Position } from '../../../../shared/models/position.model';
import { DeleteModalComponent } from 'src/app/superadmin/menu/delete-modal/delete-modal.component';
import { StateType } from 'src/app/shared/types/selection';
// import { Offer as Ioffer} from '../../../interfaces/offer';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class OfferComponent implements OnInit {
  idOffer: string;
  positionSelected: string;
  oldAnnouncementId: string;
  disabled: boolean;
  checkedAnnouncement: boolean;
  requirements: any;
  selectNewAnnouncement: boolean;
  offerHasChanges: boolean;
  minDate: Date;
  maxDate: Date;
  maxResultsSelects: number;
  dataReceived: any;
  formGroup: FormGroup;
  announcementReceived: Announcement;
  offer: Offer;
  RequirementsResult: Array<Requirement>;
  requirementsInThisOffer: Array<Requirement>;
  offerAux: Offer;
  resultsPositions: any[];
  availablePositions: any[];
  thereAreChanges: { changes: boolean, count: number };
  isValid = false;
  expired: boolean;

  @Output() emitOffer = new EventEmitter<Offer>();
  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() onNewOfferCreated = new EventEmitter<Offer>();
  @Output() onOfferCanBePublished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onOfferIsValid: EventEmitter<Offer | boolean> = new EventEmitter<Offer | boolean>();
  @Output() hasExpired = new EventEmitter<boolean>();
  @Output() hasPublicPrivateVacancies = new EventEmitter<boolean>();
  @Output() isSaved = new EventEmitter<boolean>();
  
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;
  @Input()
  set stateOffer(state: StateType) {
    if (state) {
      this.offer.state = state;
      this.changeValidators(state, this.offer);
    }
  }
  @Input()
  set getOffer(offer: Offer) {
    if (offer) {
      this.offer = offer;
    }
  }
  @Input()
  set announcement(announcement: Announcement) {
    if (announcement) {
      this.announcementReceived = announcement;
      this.createForm(this.dataReceived);
    }
  }
  dataUploader: FileUploader;
  files: any[];
  documents: any[];

  urlUpload = `${this.apiService.endpoint}/uploaderFiles/uploadMultipleFiles/`;
  // urlFileApi: string;
  checkVacancies = false; // controlar que no se pueda publicar ofertas publicas/privadas con 0 plazas

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private _location: Location,
    private logsService: LogsService,
    private dateAdapter: DateAdapter<Date>,
    private userService: UserService) {

    this.thereAreChanges = { changes: false, count: 0 };
    this.maxResultsSelects = 5;
    this.requirements = [];
    this.disabled = false;
    this.offerHasChanges = false;
    this.hasChanges.emit(false);
    this.checkedAnnouncement = false;
    this.selectNewAnnouncement = false;
    this.oldAnnouncementId = '';

    if (this.route.routeConfig.path.indexOf('ofertas') >= 1 && this.route.snapshot.paramMap.get('id') != null) {
      this.idOffer = this.route.snapshot.paramMap.get('id');
      this.api.getOfferById(this.idOffer).subscribe(
        (data: Offer) => {
          if (data) {
            this.isValid = data.isValid;
            this.onOfferCanBePublished.emit(data.isValid);
            this.dataReceived = data;
            this.createForm(data);
            this.offer = new Offer(data);
            this.offerExpired(this.offer);
            this.emitOffer.emit(this.offer);
            if (this.offer.requirement) this.requirements = [this.offer.requirement];
            this.offerAux = JSON.parse(JSON.stringify(this.offer));
          }
        });
    } else {
      this.onOfferCanBePublished.emit(false);
      this.createForm();
      this.offer = new Offer();
      this.offerAux = JSON.parse(JSON.stringify(this.offer));
    }
    if (this.router.getCurrentNavigation() !== null && this.router.getCurrentNavigation().extras.state) {
      this.disabled = this.router.getCurrentNavigation().extras.state.data.disabled;
    }
    this.apiService.getAllPositions().subscribe(d => {
      this.availablePositions = d;
    });
    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
    this.documents = [];
    this.files = [];
    // this.urlFileApi = this.urlUpload + this.idOffer;
  }
  ngOnInit() {
    this.translationsKeys = [
      'modalTranslations.offers.deletePhase',
      'modalTranslations.offers.deleteRequirement',
      'modalTranslations.offers.addPhase',
      'modalTranslations.offers.editPhase',
      'modalTranslations.offers.editingDocumentation',
      'modalTranslations.offers.messageDeleteRequirement',
      'modalTranslations.offers.editDocumentation',
      'modalTranslations.offers.addDocumentation',
      'modalTranslations.offers.of',
      'modalTranslations.common.deleteMessage',
      'logsMessages.common.downloadError',
      'logsMessages.offers.publishError',
      'logsMessages.offers.saveError',
      'logsMessages.offers.publishSuccess',
      'logsMessages.offers.publishCancel',
      'logsMessages.offers.linkSuccess',
      'logsMessages.offers.offerSavedSuccess',
      'logsMessages.offers.changeStatusError',
      'logsMessages.offers.validationError',
      'logsMessages.menu.cancel'
    ];
    this.getTranslations();
  }

  offerExpired(offer: any) {
    const utc = new Date().toJSON().slice(0, 10);
    this.expired = offer.finishAt < utc;
    return this.expired;
  }

  createUploader() {
    this.dataUploader = new FileUploader({});
  }

  getRequirements() {
    this.api.getAllRequirements().subscribe((requirements: Array<Requirement>) => {
      this.requirements = requirements;
    });
  }


  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }


  drop(event: CdkDragDrop<string[]>) {
    if (!this.disabled) moveItemInArray(this.offer.phases, event.previousIndex, event.currentIndex);
    this.thereAreChanges.count++;
  }

  createForm(data?): void {
    let titleAnnouncement = '';
    let title = '';
    let position = '';
    let category = '';
    let visibility = '';
    let vacancies = 0;
    let salary = 0;
    let startsAt = '';
    let finishAt = '';
    let description = '';
    let fees = 0;
    if (data) {
      title = data.title;
      position = (data.position) ? data.position._id : null;
      category = data.category;
      visibility = data.visibility;
      vacancies = data.vacancies;
      salary = data.salary;
      startsAt = data.startsAt;
      finishAt = data.finishAt;
      description = data.description;
      fees = data.fees;
      titleAnnouncement = data.urlAnnouncement;
      this.positionSelected = (data.position) ? data.position.name : '';
      this.checkVacanciesPrivatePublic(data.vacancies, data.visibility);

    } else {
      this.positionSelected = '';
    }
    if (this.announcementReceived || (data && data.announcement)) {
      if (this.announcementReceived) {
        titleAnnouncement = this.announcementReceived.title;
        this.checkedAnnouncement = true;
      } else {
        titleAnnouncement = data.announcement.title;
      }
    }
    const offerIsPublished = data && data.state === 'published';
    this.formGroup = this.formBuilder.group({
      title: [title, [Validators.required]],
      category: [category, offerIsPublished ? [Validators.required] : []],
      position: [position, offerIsPublished ? [Validators.required] : []],
      visibility: [visibility, (offerIsPublished) ? [Validators.required] : []],
      vacancies: [vacancies, (offerIsPublished && visibility !== 'mobility' && visibility !== 'job') ? [Validators.required] : []],
      salary: [salary, offerIsPublished ? [Validators.required] : []],
      startsAt: [startsAt, offerIsPublished ? [Validators.required] : []],
      finishAt: [finishAt, offerIsPublished ? [Validators.required] : []],
      description: [description, offerIsPublished ? [Validators.required] : []],
      fees: [fees],
      urlAnnouncement: [titleAnnouncement]
    });

    this.positionSelected = (data && data.position) ? data.position.name : '';
    this.formGroup.valueChanges.subscribe(
      str => {
        // this.checkVacancies = Number(str.vacancies) === 0 && (str.visibility === 'public' || str.visibility === 'private') ? false : true;
        this.checkVacanciesPrivatePublic(str.vacancies, str.visibility);
        this.thereAreChanges.count += 1;
        if (this.thereAreChanges.count > 0) {
          this.isSaved.emit(false);
          this.onOfferCanBePublished.emit(false);
          if (!this.offer.isValid) this.onOfferIsValid.emit(true);
        }
      }
    );
    this.formGroup.get('finishAt').valueChanges.subscribe(res => { // controlar publicable/guardar si ha vencido
      const newDate = JSON.stringify(res).slice(1, 11);
      const utc = new Date().toJSON().slice(0, 10);
      this.expired = newDate < utc;
      this.hasExpired.emit(this.expired);
    });
  }

  checkVacanciesPrivatePublic(vacan, visibility) {
    this.checkVacancies = Number(vacan) === 0 && (visibility === 'public' || visibility === 'private') ? false : true;
    this.hasPublicPrivateVacancies.emit(this.checkVacancies);
  }

  openModalAddDocumentation() {
    this.dialog.open(AddDocumentationModalComponent, {
      data: {
        id: this.idOffer,
        titleModal: this.translations['modalTranslations.offers.addDocumentation']
      },
      autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        if (!res.canceling) {
          if (res.fileUploader) {
            this.documents.push(res);
            this.files.push(res.fileUploader.queue[0].some);
          }
          this.onOfferCanBePublished.emit(false);
          this.thereAreChanges.count++;
          this.onOfferIsValid.emit(true);
          if (res.changed) {
            this.offerHasChanges = true;
            this.hasChanges.emit(true);
          }
        } else {
          this.onOfferCanBePublished.emit(this.offer.isValid);
        }
      }
    });
  }

  changeValidators(state: string, offer: Offer) {
    let controls: Array<string> = ['category', 'position', 'visibility', 'vacancies', 'salary', 'startsAt', 'finishAt', 'description'];
    if (state === 'published') {
      if (offer.visibility === 'mobility' || offer.visibility === 'job') controls = controls.filter(c => c !== 'vacancies');
      controls.forEach(control => {
        this.formGroup.controls[control].setValidators([Validators.required]);
      });
    } else {
      controls.forEach(control => {
        this.formGroup.controls[control].clearValidators();
      });
    }
  }

  publicOffer(state) {
    if (this.formGroup.valid) {
      this.api.saveOffer(this.idOffer, { state }).subscribe(
        (offer: Offer) => {
          if (offer) {
            this.offer = offer;
            this.emitOffer.emit(offer);
            this.changeValidators('published', offer);
            this.logsService.log(this.translations['logsMessages.offers.publishSuccess']);
          }
        },
        () => this.logsService.logError(this.translations['logsMessages.offers.publishError'])
      );
    } else {
      this.logsService.logError(this.translations['logsMessages.offers.validationError']);
    }
  }

  cancelOffer() {
    let jsonSend = { state: 'cancelled' };
    this.api.saveOffer(this.offer._id, jsonSend).subscribe(
      (data: any) => {
        if (data) {
          this.logsService.log(this.translations['logsMessages.offers.publishCancel']);
        }
      },
      () => this.logsService.logError(this.translations['logsMessages.offers.changeStatusError'])
    );
  }

  goBack() {
    if (this.thereAreChanges.count !== 0) {
      const dialog = this.dialog.open(DeleteModalComponent, {
        data: {
          title: `Confirmación`,
          message: 'Tiene cambios sin guardar, ¿está seguro que quiere volver?'
        }
      });
      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.logsService.log(this.translations['logsMessages.menu.cancel']);
          this._location.back();
        } else {
          dialog.close();
        }
      });
    } else {
      this._location.back();
    }
  }

  selectAnnouncement() {
    if (this.offer && this.offer.announcement) {
      this.oldAnnouncementId = this.offer.announcement._id;
    }
    this.dialog.open(LinkAnnouncementModalComponent, { data: {}, autoFocus: false }).afterClosed().subscribe(res => {
      if (res) {
        if (!this.offer.announcement) {
          this.offer.announcement = {};
        }
        this.offer.announcement._id = res._id;
        this.selectNewAnnouncement = true;
        this.thereAreChanges.count++;
        this.formGroup.controls['urlAnnouncement'].setValue(res.title);
      }
    });
  }
  saveOffer() {
    if (!this.formGroup.invalid) {
      if (!this.offer._id) {
        this.editOffer();
      } else {
        if (this.files.length) {
          this.uploadSubmit();
        } else {
          this.editOffer();
        }
      }
    }
    this.thereAreChanges.count = 0;
    this.isSaved.emit(true);
  }

  editOffer() {
    let jsonSend: any = {};
    jsonSend = this.offer;
    this.formGroup.markAsPristine();
    this.offerHasChanges = false;
    this.hasChanges.emit(false);
    let jsonAnnouncement = {};
    if (this.offer.announcement && this.selectNewAnnouncement) {
      jsonAnnouncement['newAnnouncement'] = this.offer.announcement._id;
      jsonAnnouncement['oldAnnouncement'] = this.oldAnnouncementId;
    }
    if (this.offer._id) {
      Object.keys(this.formGroup.value).forEach(key => {
        if (this.formGroup.value[key] != null) {
          jsonSend[key] = this.formGroup.value[key];
        }
      });
      this.api.saveOffer(this.offer._id, jsonSend, jsonAnnouncement).subscribe(
        (offer: Offer) => {
          if (offer) {
            this.offer.isValid = offer.isValid;
            this.isValid = offer.isValid;
            this.thereAreChanges.count = 0;
            this.onOfferCanBePublished.emit((this.offer.isValid));
            this.onOfferIsValid.emit(this.offer);
            this.hasExpired.emit(this.offerExpired(offer));
            if (this.announcementReceived) {
              this.emitOffer.emit(offer);
            }
            this.logsService.log(this.translations['logsMessages.offers.offerSavedSuccess']);
          }
        },
        (err) => {
          // console.info('error', err);
          this.logsService.logError(this.translations['logsMessages.offers.saveError']);
        }
      );
    } else {
      jsonSend['vacancies'] = 0;
      Object.keys(this.formGroup.value).forEach(key => {
        if (this.formGroup.value[key] != null && this.formGroup.value[key] !== '') {
          jsonSend[key] = this.formGroup.value[key];
        }
      });
      jsonSend['state'] = 'incomplete';
      this.api.addNewOffer(jsonSend, jsonAnnouncement).subscribe(
        (offer: Offer) => {
          if (offer) {
            this.offer = offer;
            this.isValid = offer.isValid;
            this.thereAreChanges.count = 0;
            this.onOfferCanBePublished.emit(this.offer.isValid);
            this.onOfferIsValid.emit(this.offer);
            this.onNewOfferCreated.emit(this.offer);
            this.hasExpired.emit(this.offerExpired(offer));
            this.idOffer = this.offer._id;
            // this.urlFileApi = this.urlUpload + this.idOffer;
            if (this.announcementReceived) {
              this.emitOffer.emit(offer);
            }
            this.logsService.log(this.translations['logsMessages.offers.offerSavedSuccess']);
            if (this.files.length) {
              this.uploadSubmit();
            }
            let url = window.location.href;
            url = url.split('/add')[0] + `/edit/${offer._id}`;
            window.history.replaceState(null, null, url);
          }
        },
        () => this.logsService.logError(this.translations['logsMessages.offers.saveError'])
      );
    }
  }
  setValue(index, date) {
    if (index === 0) {
      let dateMin = new Date(date.value);
      // Le sumo 1 al dia, porque en el date de Material, el primer dia del mes es 0
      dateMin.setDate(dateMin.getDate() + 1);
      this.minDate = dateMin;
    } else if (index === 1) {
      let dateMax = new Date(date.value);
      // Le resto 1 al dia, porque en el date de Material
      dateMax.setDate(dateMax.getDate() - 1);
      this.maxDate = dateMax;
    }
  }
  deletePhase(phase, index) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.deletePhase'], message: this.translations['modalTranslations.common.deleteMessage'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.offer.phases.splice(index, 1);
        this.onOfferCanBePublished.emit(false);
        this.onOfferIsValid.emit(true);
        this.offerHasChanges = true;
        this.hasChanges.emit(true);
        this.thereAreChanges.count++;
      }
    });
  }
  editPhase(phase, index) {
    this.dialog.open(AddPhaseModalComponent, {
      width: '900px',
      data: {
        phase: phase,
        titleModal: this.translations['modalTranslations.offers.editPhase']
      },
      autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        if (!res.canceling) {
          this.offer.phases[index] = res;
          this.offerHasChanges = true;
          this.hasChanges.emit(true);
          this.thereAreChanges.count++;
          this.onOfferCanBePublished.emit(false);
          this.onOfferIsValid.emit(true);
        } else {
          this.onOfferCanBePublished.emit(this.offer.isValid);
        }
      }
    });
  }
  openModalAddRequirementCriterion() {
    this.dialog.open(AddRequirementCriterionModalComponent, {
      width: '900px',
      data: {
        offer: this.offer
      }
    })
      .afterClosed().subscribe((res: { canceling: boolean, requirementId: string, requirement: Requirement }) => {
        if (res && !res.canceling) {
          this.offer.requirement = res.requirement;
          this.requirements = [res.requirement];
          this.thereAreChanges.count++;
          this.hasChanges.emit(true);
        }
      });
  }
  deleteDoc(doc, index) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.editingDocumentation'], message: this.translations['modalTranslations.common.deleteMessage'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.offer.documentation.splice(index, 1);
        this.offerHasChanges = true;
        this.hasChanges.emit(true);
        this.onOfferCanBePublished.emit(false);
        this.thereAreChanges.count++;
        this.onOfferIsValid.emit(true);
      }
    });
  }

  editDoc(doc, index) {
    this.dialog.open(AddDocumentationModalComponent, {
      data: {
        doc: doc,
        titleModal: this.translations['modalTranslations.offers.editingDocumentation'],
        idOffer: this.offer._id
      }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        if (!res.canceling) {
          if (res.fileUploader) {
            this.documents.push(res);
            this.files.push(res.fileUploader.queue[0].some);
            this.offer.documentation.splice(index, 1);
          } else {
            this.offer.documentation[index].title = res.title;
            this.offer.documentation[index].file = res.file;
            this.offer.documentation[index].visibility = res.visibility;
          }
          this.offerHasChanges = true;
          this.hasChanges.emit(true);
          this.thereAreChanges.count++;
          this.onOfferCanBePublished.emit(false);
          this.onOfferIsValid.emit(true);
        } else {
          this.onOfferCanBePublished.emit(this.offer.isValid);
        }
      }
    });
  }

  downloadFile(fileId, file) {
    this.apiService.downloadFile(fileId).subscribe((data: any) => {
      const fileExt = file.split('.');
      const ext = fileExt[fileExt.length - 1];
      if (data) {
        const blob = new Blob([data]);
        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob);
          return;
        }
        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const dataBlob = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = dataBlob;
        link.download = `${fileId.toString()}.${ext}`;
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    },
      () => this.logsService.logError(this.translations['logsMessages.common.downloadError'])
    );
  }

  findPositions(value, array) {
    this.resultsPositions = [];
    if (value !== '') {
      for (let index = 0; index < this.availablePositions.length; index++) {
        if (this.availablePositions[index] !== undefined && this.availablePositions[index].name
          .toLowerCase()
          .indexOf(value.toLowerCase()) !== -1 && this.resultsPositions.length <= this.maxResultsSelects) {
          this.resultsPositions.push(this.availablePositions[index]);
        }
      }
    }
  }
  checkArrays(arrayOffer, arrayOfferAux) {
    let changes = false;
    if (arrayOffer.length !== arrayOfferAux.length) {
      changes = true;
    } else {
      for (let index = 0; index < arrayOffer.length; index++) {
        Object.keys(arrayOffer[index]).forEach(key => {
          if (arrayOffer[index][key] !== arrayOfferAux[index][key]) {
            changes = true;
          }
        });
      }
    }
    return changes;
  }
  // checkOffer() { // ToDo no se usa?
  //   const offerCreated = new Offer(this.formGroup.value);
  //   const notCheck = ['requirements', 'phases', 'documentation'];
  //   (this.offerHasChanges || this.formGroup.dirty)
  //     ? this.hasChanges.emit(true)
  //     : this.hasChanges.emit(false);
  // }
  // MODALS
  openModalAddPosition() {
    this.dialog.open(AddPositionModalComponent, {
      width: '900px',
      data: {
        positions: this.availablePositions
      }
    }).afterClosed().subscribe((res: { canceling: boolean, position: Position }) => {
      if (res && !res.canceling) {
        this.positionSelected = res.position.name;
        this.formGroup.controls['position'].setValue(res.position._id);
        this.thereAreChanges.count++;
        this.hasChanges.emit(true);
      }
    });
  }
  deleteRequirement(index) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent,
      {
        data:
        {
          title: ` ${this.translations['modalTranslations.offers.deleteRequirement']} ${this.offer.title}`,
          message: `${this.translations['modalTranslations.offers.messageDeleteRequirement']} ${this.offer.requirement.title}.
            ${this.translations['modalTranslations.common.deleteMessage']}`
        }, autoFocus: false
      });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.offer.requirement = null;
        this.requirements = [];
        this.thereAreChanges.count++;
      }
    });
  }

  openModalAddPhase() {
    this.dialog.open(AddPhaseModalComponent, {
      width: '800px',
      data: {
        titleModal: this.translations['modalTranslations.offers.addPhase']
      },
      autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        if (!res.canceling) {
          res.attachedFiles = [];
          res.attachedFiles.push(res.file);
          delete res.file;
          this.offer.phases.push(res);
          this.onOfferCanBePublished.emit(false);
          this.onOfferIsValid.emit(true);
          this.thereAreChanges.count++;
          if (res.changed) {
            this.offerHasChanges = true;
            this.hasChanges.emit(true);
          }
        } else {
          this.onOfferCanBePublished.emit(this.offer.isValid);
        }
      }
    });
  }

  uploadSubmit(): any {
    this.createUploader();
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.dataUploader.addToQueue(this.files);
    for (let i = 0; i < this.dataUploader.queue.length; i++) {
      this.dataUploader.queue[i].headers = requestHeaders;
      this.dataUploader.queue[i].method = 'POST';
      this.dataUploader.queue[i].url = (this.documents[i].visibility === 'public')
        ? this.urlUpload + `?path=offer/${this.idOffer}&privateFile=false`
        : this.urlUpload + `?path=offer/${this.idOffer}&privateFile=true`;
    }
    this.dataUploader.uploadAll();
    this.dataUploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      let jsonResponse = JSON.parse(response);
      let index = this.dataUploader.getIndexOfItem(item);
      this.documents[index]._id = jsonResponse.uploadedFile._id;
      // this.documents[index].file = jsonResponse.url;
      this.documents[index].fileUploader = null;
      this.offer.documentation.push(this.documents[index]);
    };

    this.dataUploader.onCompleteAll = () => {
      this.editOffer();
      this.files = [];
      this.documents = [];
    };
    this.logsService.log('Cargando archivo... Recibirás una notificación cuando se haya completado la acción.');
  }

  deleteDocNotUploaded(index: number) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.offers.editingDocumentation'], message: this.translations['modalTranslations.common.deleteMessage'] }, autoFocus: false });
    dialog.afterClosed().subscribe(res => {
      if (res) {
        this.documents.splice(index, 1);
        this.files.splice(index, 1);
        this.offerHasChanges = true;
        this.hasChanges.emit(true);
        this.thereAreChanges.count++;
      }
    });
  }

  editDocNotUploaded(doc: any, index: number) {
    this.dialog.open(AddDocumentationModalComponent, { data: { doc: doc, titleModal: this.translations['modalTranslations.offers.editingDocumentation'] }, autoFocus: false })
      .afterClosed().subscribe(res => {
        if (res) {
          this.documents[index] = res;
          if (res.fileUploader) {
            this.files[index] = res.fileUploader.queue[0].some;
          }
          if (res.changed) {
            this.offerHasChanges = true;
            this.hasChanges.emit(true);
            this.thereAreChanges.count++;
          }
        }
      });
  }

  changeOffer() {
    this.hasChanges.emit(true);
  }
}
