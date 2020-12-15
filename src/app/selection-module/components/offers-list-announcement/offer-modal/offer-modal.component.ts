import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Requirement } from '../../../interfaces/requirement';
import { AddPhaseModalComponent } from '../../offers/offer/modals/add-phase-modal/add-phase-modal.component';
import { Offer } from 'src/app/selection-module/interfaces/offer';


@Component({
  selector: 'offer-modal',
  templateUrl: 'offer-modal.component.html',
  styleUrls: ['./offer-modal.component.scss']
})
export class OfferModalComponent {
  private formGroup: FormGroup;
  public offer: Offer;
  public detailsMode: boolean;
  public employeeHasCurriculum: string;
  public requirements: Array<Requirement>;

  public onApply: EventEmitter<Offer>;
  public onDeApply: EventEmitter<Offer>;

  constructor(
    public dialogRef: MatDialogRef<OfferModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
    this.onApply = new EventEmitter();
    this.onDeApply = new EventEmitter();
    this.offer = this.data.offer;
    this.detailsMode = this.data.detailsMode;
    this.employeeHasCurriculum = this.data.employeeHasCurriculum;
    this.requirements = (this.data.offer.requirement) ? [this.data.offer.requirement] : [];

    this.createForm(this.offer, '');
  }

  createForm(offer, announcementTitle): void {
    this.formGroup = this.formBuilder.group({
      title: [offer.title, []],
      position: [offer.position.name, []],
      vacancies: [offer.vacancies, []],
      salary: [offer.salary, []],
      startsAt: [offer.startsAt, []],
      finishAt: [offer.finishAt, []],
      description: [offer.description, []],
      fees: [offer.fees],
      urlAnnouncement: [offer.announcement ? offer.announcement.title : 'No enlazada a ninguna convocatoria']
    });
  }

  close(data?): void {
    this.dialogRef.close(data);
  }

  openModalInfo(phase: any, i: number) {
    this.dialog.open(AddPhaseModalComponent, { data: { readonly: true, phase }, autoFocus: false });
  }


  applyOffer(offer: Offer) {
    this.onApply.emit(offer);
    this.offer.applied = true;
  }

  deApplyOffer(offer: Offer) {
    this.onDeApply.emit(offer);
    this.offer.applied = false;
  }

  offerClosed(offer: Offer) {
    const utc = new Date().toJSON().slice(0, 10);
    return offer.finishAt < utc;
  }
}
