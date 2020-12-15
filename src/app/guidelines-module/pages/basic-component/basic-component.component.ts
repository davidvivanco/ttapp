import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-basic-component',
  templateUrl: './basic-component.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class BasicComponentComponent implements OnInit {

  publishState = false;

  breadcrumb = `<div class="row">
  <app-breadcrumb breadcrumbs="Talentoo,Guía de estilo"></app-breadcrumb>

  <div class="col-12">
    <button mat-flat-button class="btn-primary btn-sm mr-m">
      <mat-icon class="mr-sm">add_circle_outline</mat-icon>Botón
    </button>
    <button mat-flat-button class="btn-primary btn-sm mr-m">
      <mat-icon class="mr-sm">add_circle_outline</mat-icon>Botón
    </button>
  </div>
</div>`;

  card1 = `
  <div class="row">
    <div class="col-12">
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
                <span class="ml-sm f-s">Primary</span>
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
