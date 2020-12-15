import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Offer } from '../../../interfaces/offer';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html'
})
export class AddOfferComponent implements OnInit, ComponentCanDeactivate {

  offerCanBePublished: boolean;
  showView: boolean;
  offerState: string;
  offerIsvalid: boolean;
  idOffer: string;
  offer: Offer;
  fromEdit = false;
  unsavedChanges = false;
  hasExpired: boolean;
  hasPubPriVacan: boolean;
  isSaved = true;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  constructor(
    private api: SelectionApiService,
    private route: ActivatedRoute,
    private logsService: LogsService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog,
    private _location: Location) {
    this.idOffer = this.route.snapshot.paramMap.get('id');
    if (!this.idOffer) this.showView = true;
  }

  ngOnInit() {
    if (this.route.routeConfig.path.includes('/edit')) {
      this.fromEdit = true;
    }
    this.translationsKeys = [
      'logsMessages.offers.publishCancel',
      'logsMessages.offers.changeStatusError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  changeStateOffer(state) {
    this.api.saveOffer(this.idOffer, { state }).subscribe(
      (offer: Offer) => {
        if (offer) {
          this.logsService.log(this.translations['logsMessages.offers.publishCancel']);
          this.offer = offer;
          this.offerState = offer.state;
        }

      },
      () => this.logsService.logError(this.translations['logsMessages.offers.changeStatusError'])
    );
  }

  showPublishButton(canBePublish: boolean) {
    this.showView = true;
    if (this.idOffer) this.offerCanBePublished = canBePublish;
  }

  goBack() {
    this.router.navigate([`seleccion/admin/ofertas`]);
  }

  setOfferIsValid(isValid: boolean) {
    this.offerIsvalid = isValid;
  }

  setOffer(offer: Offer & boolean) {
    this.showView = true;
    if (typeof offer !== 'boolean') {
      this.offer = offer;
      this.offerExpired(this.offer);
      this.idOffer = offer._id;
      this.offerIsvalid = offer.isValid;
    } else this.offerIsvalid = offer;

  }

  setOfferHasChanges(hasUnsavedChanges) {
    this.unsavedChanges = hasUnsavedChanges;
  }

  canDeactivate() {
    return !this.unsavedChanges;
  }

  offerExpired(offer: Offer) {
    const utc = new Date().toJSON().slice(0, 10);
    if (offer.finishAt) this.hasExpired = offer.finishAt < utc;
    return this.hasExpired;
  }

  offerHasExpired(event) {
    setTimeout(() => { // evitar el error nghaschangedafterchecked
      this.hasExpired = event;
    });
  }

  checkPubPriVacancies(event) {
    this.hasPubPriVacan = event;
  }

  checkSaved(isSaved) {
    this.isSaved = isSaved;
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
}
