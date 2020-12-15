import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteModalComponent>) {
    dialogRef.disableClose = true;
  }
  ngOnInit() {
  }

  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }

  cancel() {
    this.dialogRef.close();
  }
}
