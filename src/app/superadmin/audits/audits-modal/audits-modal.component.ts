import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-audits-modal',
  templateUrl: './audits-modal.component.html',
  styleUrls: ['./audits-modal.component.scss'],
})
export class AuditsModalComponent {
  count: number;
  constructor(
    public dialogRef: MatDialogRef<AuditsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    //check if data to show then in html
    this.count = Object.keys(this.data.data).length;
  }
  close(): void {
    this.dialogRef.close();
  }
}


