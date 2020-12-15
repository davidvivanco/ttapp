import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesButtonsComponent implements OnInit {

  buttons = `<button mat-flat-button class="btn-primary">
  <mat-icon>chevron_right</mat-icon> Primary
</button>

<button mat-flat-button class="btn-secondary">
  <mat-icon>chevron_right</mat-icon> Secondary
</button>

<button mat-stroked-button class="btn-stroked-primary">
  <mat-icon>chevron_right</mat-icon> Stroked
</button>

<button class="mat-button">
  Cancelar
</button>

<button mat-flat-button class="btn-primary btn-sm">
  <mat-icon>chevron_right</mat-icon> Primary
</button>

<button mat-flat-button class="btn-secondary btn-sm">
  <mat-icon>chevron_right</mat-icon> Secondary
</button>

<button mat-stroked-button class="btn-stroked-primary btn-sm">
  <mat-icon>chevron_right</mat-icon> Stroked
</button>

<button class="mat-button btn-sm">
  Cancelar
</button>

<button mat-fab class="btn-primary">
  <mat-icon>chat_bubble</mat-icon>
</button>

<button mat-fab class="btn-secondary">
  <mat-icon>phone</mat-icon>
</button>

<button mat-fab class="btn-primary mat-fab-stroked">
  <mat-icon>hearing</mat-icon>
</button>

<button mat-fab class="btn-secondary mat-fab-stroked">
  <mat-icon>text_sms</mat-icon>
</button>`;

  constructor() { }

  ngOnInit() {
  }

}
