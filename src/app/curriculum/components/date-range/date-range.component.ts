import { Component, Input, Self, Optional } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { MY_FORMATS } from 'src/app/globals';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DateRangeComponent implements ControlValueAccessor {
  value = [];
  @Input() startLabel = 'Inicio';
  @Input() endLabel = 'Fin';
  @Input() required: boolean;
  @Input() label;


  currently = false;

  minDate;
  maxDate;


  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl,
    private dateAdapter: DateAdapter<Date>
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }

  writeValue(value) {
    this.value = Array.isArray(value) ? value : [];
    if (!this.value[1]) this.currently = true;
    this.value.forEach((element, index) => {
      this.setMaxMinDate(index, element);
    });
  }

  registerOnChange(fn) {
    this.onChangeFn = fn;
  }

  setValue(index, el) {
    this.value[index] = el.value;
    this.onChangeFn(this.value);
    this.onTouchedFn();
    this.setMaxMinDate(index, el.value);
  }

  setMaxMinDate(index, date) {
    if (index === 0) {
      const dateMin = new Date(date);
      // Le sumo 1 al dia, porque en el date de Material, el primer dia del mes es 0
      dateMin.setDate(dateMin.getDate() + 1);
      this.minDate = dateMin;
    } else if (index === 1) {
      let dateMax = new Date(date);
      // Le resto 1 al dia, porque en el date de Material
      dateMax.setDate(dateMax.getDate() - 1);
      this.maxDate = dateMax;
    }
  }

  registerOnTouched(fn) {
    this.onTouchedFn = fn;
  }

  private onChangeFn(value) { }
  private onTouchedFn() { }

  currentlySwitch() {
    this.currently = !this.currently;
    if (this.currently) this.value[1] = null;
  }

}
