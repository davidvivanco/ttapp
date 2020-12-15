import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html'
})
export class ModalsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ModalsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // console.log('Modal open', data);
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  close(data?): void {
      this.dialogRef.close(data);
  }

}
