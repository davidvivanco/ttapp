import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html'
})
export class DeleteConfirmationModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteConfirmationModalComponent>,
  ) {
    dialogRef.disableClose = true;
  }
  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }
  ngOnInit() {
  }
}
