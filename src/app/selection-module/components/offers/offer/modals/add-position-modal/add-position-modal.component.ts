import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

interface PositionsAvailable {
  _id: string;
  id: string;
  code: string;
  description: string;
  name: string;
}


@Component({
  selector: 'app-add-position-modal',
  templateUrl: './add-position-modal.component.html'
})
export class AddPositionModalComponent implements OnInit {


  positions: Array<PositionsAvailable>;
  positionSelected: PositionsAvailable;
  displayedColumns = ['name', 'actions'];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { positions: Array<PositionsAvailable> },
    public dialogRef: MatDialogRef<AddPositionModalComponent>,

  ) {

  }

  ngOnInit() {
    this.positions = this.data.positions;
  }

  submit(position: PositionsAvailable) {
    this.positionSelected = position;
    this.close(false);
  }

  close(canceling?: boolean): void {
    this.dialogRef.close({ canceling, position: this.positionSelected }, );
  }

  cancel() {
    this.close(true);
  }
}
