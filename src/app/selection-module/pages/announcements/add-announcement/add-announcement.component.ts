import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Announcement } from 'src/app/shared/models/announcement.model';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { OfferComponent } from '../../../components/offers/offer/offer.component';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html'
})
export class AddAnnouncementComponent implements OnInit, ComponentCanDeactivate {

  page = 'home';
  state: string = null;
  edit = false;
  idAnnouncement: string;
  announcement: Announcement;
  unsavedChanges = false;
  showView: boolean;
  hasChanges: boolean;

  @ViewChild(OfferComponent)
  private offerComponentPage: any;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  constructor(
    private router: Router,
    private logsService: LogsService,
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private translate: TranslateService,
    private dialog: MatDialog) {
    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
      this.edit = this.router.getCurrentNavigation().extras.state.data.edit;
    }
  }

  ngOnInit() {
    this.idAnnouncement = this.route.snapshot.paramMap.get('id');
    if (this.idAnnouncement !== null) {
      this.api.getAnnouncementById(this.idAnnouncement).subscribe(
        (data: { announcement: Announcement }) => {
          if (data) {
            this.announcement = new Announcement(data.announcement);
          }
        });
    } else {
      this.announcement = new Announcement();
    }
    this.translationsKeys = [
      'modalTranslations.common.confirmation',
      'modalTranslations.offers.noSaveChanges',
      'logsMessages.announcements.announcementRevokedSuccess',
      'logsMessages.announcements.announcementPublishedSuccess',
      'logsMessages.announcements.announcementPublishError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  setAnnouncementHasChanges(hasUnsavedChanges) {
    this.unsavedChanges = hasUnsavedChanges;
  }

  setAnnouncement(announcement: Announcement) {
    this.announcement = announcement;
  }

  goBack() {
    switch (this.page) {
      case 'home':
        this.calculateBackPage();
        break;

      case 'addOffer':
        this.offerComponentPage.checkOffer();
        if (this.hasChanges) {
          const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.translations['modalTranslations.common.confirmation'], message: this.translations['modalTranslations.offers.noSaveChanges'] } });
          dialog.afterClosed().subscribe(accepts => {
            if (accepts) {
              this.calculateBackPage();
            }
          });
        } else {
          this.calculateBackPage();
        }
        break;

      default:
        break;
    }
  }

  emitOffer(offer) {
    this.announcement.offers.push(offer);
  }

  calculateBackPage() {
    if (this.page === 'home') this.router.navigateByUrl(`/seleccion/admin/convocatorias`);
    else this.changePage('home');
  }

  checkChanges(change) {
    this.hasChanges = change;
  }

  changePage(page) {
    this.page = page;
  }

  changeStateAnnouncement(state) {
    let jsonSend = { state };

    this.api.saveAnnouncement(this.announcement._id, jsonSend).subscribe(
      (data: any) => {
        if (data) {
          this.logsService.log((state === 'cancelled')
            ? this.translations['logsMessages.announcements.announcementRevokedSuccess']
            : this.translations['logsMessages.announcements.announcementPublishedSuccess']);

          this.announcement.state = state;
          this.state = state;
        }

      },
      () => this.logsService.logError(this.translations['logsMessages.announcements.announcementPublishError'])
    );
  }

  canDeactivate() {
    return !this.unsavedChanges;
  }

}
