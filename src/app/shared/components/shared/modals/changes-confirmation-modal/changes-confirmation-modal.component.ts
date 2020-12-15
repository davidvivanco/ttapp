import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-changes-confirmation-modal',
  templateUrl: './changes-confirmation-modal.component.html'
})
export class ChangesConfirmationModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ChangesConfirmationModalComponent>) {
    dialogRef.disableClose = true;
  }
  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }
  ngOnInit() {
  }

}
