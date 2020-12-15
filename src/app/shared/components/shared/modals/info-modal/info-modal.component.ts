import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html'
})
export class InfoModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<InfoModalComponent>,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }

}
