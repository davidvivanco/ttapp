import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guidelines-columns-grid',
  templateUrl: './guidelines-columns-grid.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesColumnsGridComponent implements OnInit {

  gridBasic = `<div class="row">
  <div class="col-12"></div>
  <div class="col-6"></div><div class="col-6"></div>
  <div class="col-3"></div><div class="col-6"></div><div class="col-3"></div>
</div>`;

  gridCards = `<div class="row">
  <div class="col-6">
    <mat-card class="card-dark-header">
      <mat-card-header>
          <mat-card-title>
              <mat-icon>speaker_notes</mat-icon>
          </mat-card-title>
          <p>Card dark header title</p>
      </mat-card-header>
      <div class="clearfix"></div>
      <mat-card-content>
          <p class="description">
              Card content
          </p>
      </mat-card-content>
      <div class="clearfix"></div>
      <mat-card-actions class="right">
        <button mat-flat-button class="btn-primary">
          <span class="ml-sm">Primary</span>
          <mat-icon>chevron_right</mat-icon>
        </button>
      </mat-card-actions>
      <div class="clearfix"></div>
  </mat-card>
  </div><div class="col-6">
    <mat-card class="card-dark-header">
      <mat-card-header>
          <mat-card-title>
              <mat-icon>speaker_notes</mat-icon>
          </mat-card-title>
          <p>Card dark header title</p>
      </mat-card-header>
      <div class="clearfix"></div>
      <mat-card-content>
          <p class="description">
              Card content
          </p>
      </mat-card-content>
      <div class="clearfix"></div>
      <mat-card-actions class="right">
        <button mat-flat-button class="btn-primary">
          <span class="ml-sm">Primary</span>
          <mat-icon>chevron_right</mat-icon>
        </button>
      </mat-card-actions>
      <div class="clearfix"></div>
  </mat-card>
  </div>
</div>`;

  constructor() { }

  ngOnInit() {
  }

}
