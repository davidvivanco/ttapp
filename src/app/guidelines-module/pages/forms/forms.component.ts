import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class FormsComponent implements OnInit {

  textFormControl = new FormControl('', [
    Validators.required,
  ]);

  animalControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  animals = [
    {name: 'Dog', sound: 'Woof!'},
    {name: 'Cat', sound: 'Meow!'},
    {name: 'Cow', sound: 'Moo!'},
    {name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!'},
  ];

  text = `<mat-form-field>
  <input matInput placeholder="Text input" [formControl]="textFormControl">
  <mat-icon matSuffix>mode_edit</mat-icon>
  <mat-hint>Campo obligatorio</mat-hint>
  <mat-error *ngIf="textFormControl.hasError('required')">
    Error requiered
  </mat-error>
</mat-form-field>`;

  textarea = `<mat-form-field>
  <textarea matInput placeholder="Textarea input" [formControl]="textFormControl"></textarea>
  <mat-hint>Campo obligatorio</mat-hint>
  <mat-error *ngIf="textFormControl.hasError('required')">
    Error requiered
  </mat-error>
</mat-form-field>`;

  date = `<mat-form-field>
  <mat-label>Choose a date</mat-label>
  <input matInput [matDatepicker]="picker">
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>`;

  daterange = `<div class="daterange">
  <div class="col-6">
    <mat-form-field>
      <mat-label>Choose a date</mat-label>
      <input matInput [matDatepicker]="picker2">
      <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
      <mat-datepicker #picker2></mat-datepicker>
    </mat-form-field>
  </div>
  <div class="col-6">
    <mat-form-field>
      <mat-label>Choose a date</mat-label>
      <input matInput [matDatepicker]="picker3">
      <mat-datepicker-toggle matSuffix [for]="picker3"></mat-datepicker-toggle>
      <mat-datepicker #picker3></mat-datepicker>
    </mat-form-field>
  </div>
</div>`;

  select = `<mat-form-field>
  <mat-label>Favorite animal</mat-label>
  <mat-select [formControl]="animalControl" required>
    <mat-option>--</mat-option>
    <mat-option *ngFor="let animal of animals" [value]="animal">
      {{animal.name}}
    </mat-option>
  </mat-select>
  <mat-error *ngIf="animalControl.hasError('required')">Please choose an animal</mat-error>
  <mat-hint>{{animalControl.value?.sound}}</mat-hint>
</mat-form-field>`;

  checkbox = `<mat-checkbox
  class="example-margin"
  [checked]="false"
  [disabled]="false">
  I'm a checkbox
</mat-checkbox>`;

  radio = `<mat-radio-group aria-label="Select an option">
  <mat-radio-button value="1">Option 1</mat-radio-button>
  <mat-radio-button value="2">Option 2</mat-radio-button>
</mat-radio-group>`;

  slideToggle = `<mat-slide-toggle>Slide me!</mat-slide-toggle>`;

  datePipe = `{{value | date: 'dd/MM/yyyy'}}`;

  constructor() {}

  ngOnInit() {
  }

}
