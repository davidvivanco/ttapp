import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SelectionApiService } from '../../../../../services/selection.api.services';
import { Offer } from 'src/app/shared/models/offer.model';
import { VisibilityType } from 'src/app/shared/types/selection';


@Component({
  selector: 'app-link-offers-modal',
  templateUrl: 'link-offers-modal.component.html'
})
export class LinkOffersModalComponent {

  loading: boolean;
  visibility: string;
  title: string;
  displayedColumns: string[] = ['name', 'actions'];
  offers: Array<Offer>;
  offersInAnnouncement: [];

  constructor(
    public dialogRef: MatDialogRef<LinkOffersModalComponent>,
    public api: SelectionApiService,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.loading = false;
    if (data && data.titleModal) {
      this.visibility = data.visibility;
      this.title = data.titleModal;
      this.offersInAnnouncement = data.offersInAnnouncement;
    }
  }

  ngOnInit() {
    this.loading = true;
    this.getData();

  }

  getData() {
    this.api.getFreeOffers(this.visibility).subscribe(
      (data: Array<Offer>) => {
        if (data) {
          this.offersInAnnouncement.forEach((offer: string) => {
            const index = data.findIndex(o => o._id === offer);
            if (index > -1) data.splice(index, 1);
          });
          this.offers = data;
          this.loading = false;
        }
        //
      },
      (err) => console.log('error', err)
    );
  }

  submit(offers: Array<Offer>) {
    this.close(offers);
  }

  close(data?, canceling?: boolean): void {
    this.dialogRef.close({ offers: data, canceling });
  }

  cancel() {
    this.close(null, true);
  }

}