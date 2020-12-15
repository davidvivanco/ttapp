import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Col } from '../../../../../interfaces/dashboard';

@Component({
  selector: 'app-grid-modal',
  templateUrl: './grid-modal.component.html',
  styleUrls: ['./grid-modal.component.scss']
})
export class GridModalComponent implements OnInit {

  cardPositionId: string;
  dashboardId: string;
  chart: Col;

  constructor(
    public dialogRef: MatDialogRef<GridModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.cardPositionId = data.cardPositionId;
    this.dashboardId = data.dashboardId;
    this.chart = data.chart;
    this.chart.id = 'tablaUsuarios';
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
