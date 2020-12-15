import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Requirement } from 'src/app/selection-module/interfaces/requirement';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Offer } from 'src/app/shared/models/offer.model';
import { ModalTranslationsAccess } from '../../../models/jobWebsiteTranslation.interface';
import { AccessModalComponent } from '../access-modal/access-modal.component';

@Component({
  selector: 'app-offer-modal',
  templateUrl: './offer-modal.component.html',
  styleUrls: ['./offer-modal.component.scss']
})
export class OfferModalComponent implements OnInit {
  private formGroup: FormGroup;
  public offer: Offer;
  public requeriments: Array<Requirement>;

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: ModalTranslationsAccess;

  constructor(
    public dialogRef: MatDialogRef<OfferModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.offer = this.data.offer;
    this.requeriments = (this.data.offer.requeriment) ? [this.data.offer.requeriment] : [];
    this.createForm(this.offer);
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'jobWebsite.accessModal.title',
      'jobWebsite.accessModal.message'
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: ModalTranslationsAccess) => {
        this.logsMessagesTranslations = translations
      })
  }

  createForm(offer): void {
    this.formGroup = this.formBuilder.group({
      title: [offer.title, []],
      position: [offer.position.name, []],
      vacancies: [offer.vacancies, []],
      salary: [offer.salary, []],
      startsAt: [{ value: offer.startsAt, disabled: true }, []],
      finishAt: [{ value: offer.finishAt, disabled: true }, []],
      description: [offer.description, []],
      fees: [offer.fees],
      urlAnnouncement: [offer.announcement ? offer.announcement.title : 'No enlazada a ninguna convocatoria']
    });
  }

  close(data?): void {
    this.dialogRef.close(data);
  }

  openModalInfo() {
    this.dialog.open(DeleteConfirmationModalComponent, { data: { title: "Info", message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec eleifend lacus" }, autoFocus: false });
  }

  applyOffer() {
    this.dialog.open(AccessModalComponent, {
      data: {
        title: this.logsMessagesTranslations['jobWebsite.accessModal.title'],
        message: this.logsMessagesTranslations['jobWebsite.accessModal.message']
      }
    });
  }

}
