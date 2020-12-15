import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { OfferModalComponent } from '../../offers-list-announcement/offer-modal/offer-modal.component';
import { Offer } from '../../../interfaces/offer';


@Component({
  selector: 'announcement-modal',
  templateUrl: 'announcement-modal.component.html',
  styleUrls: ['./announcement-modal.component.scss']
})
export class AnnouncementModalComponent {
  private formGroup: FormGroup;
  public announcement: any;

  constructor(
    public dialogRef: MatDialogRef<AnnouncementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
    this.announcement = this.data.announcement;
    this.createForm(this.announcement);
  }

  close(data?): void {
    this.dialogRef.close(data);
  }

  createForm(announcement): void {
    this.formGroup = this.formBuilder.group({
      title: [announcement.title, []],
      category: [announcement.category, []],
      visibility: [announcement.visibility, []],
      vacancies: [announcement.vacancies, []],
      startsAt: [announcement.startsAt, []],
      finishAt: [announcement.finishAt, []],
      description: [announcement.description, []],
      totalVacancies: [announcement.offers.reduce((prev, cur) => parseInt(prev) + parseInt(cur.vacancies), 0), []]
    });
  }

  openModalInfo(offer: any) {
    this.dialog.open(OfferModalComponent, { data: { offer }, autoFocus: false});
  }

  announcementExpired(announcement: any) {
    const utc = new Date().toJSON().slice(0, 10);
    return announcement.finishAt < utc;
  }
}
