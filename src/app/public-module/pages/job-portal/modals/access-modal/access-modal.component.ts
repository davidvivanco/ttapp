import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalLoginComponent } from '../modal-login/modal-login.component';

@Component({
  selector: 'app-access-modal',
  templateUrl: './access-modal.component.html',
  styleUrls: ['./access-modal.component.scss']
})
export class AccessModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AccessModalComponent>,
    public dialog: MatDialog
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() { }

  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }

  openLoginModal() {
    this.dialog.open(ModalLoginComponent);
    this.closeModal(true);
  }
}
