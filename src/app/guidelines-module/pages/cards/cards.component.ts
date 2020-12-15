import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class CardsComponent implements OnInit {

  cardMain = `<div class="row">
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
              <span class="ml-sm">Primary</span>
              <mat-icon>chevron_right</mat-icon>
            </button>
          </mat-card-actions>
          <div class="clearfix"></div>
      </mat-card>
  </div>
</div>`;

  cardBlank = `<div class="row">
  <div class="col-12">
      <mat-card class="blank-header">
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

  accordeon = `<div class="row">
  <div class="col-12">
    <mat-accordion class="dark-header">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            <span>Accordion title</span>
          </mat-panel-title>
        </mat-expansion-panel-header>
        <div class="clearfix"></div>
        <!-- Contenido del acordeón -->
        <div class="clearfix"></div>
        <div class="accordion-actions mb-m right">
          <button mat-flat-button class="btn-primary">Button</button>
        </div>
      </mat-expansion-panel>
    </mat-accordion>
  </div>
</div>`;

  constructor() { }

  ngOnInit() {
  }

}
