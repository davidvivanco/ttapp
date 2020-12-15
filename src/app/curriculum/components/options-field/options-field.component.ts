import { Component, Self, Optional, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-options-field',
  templateUrl: './options-field.component.html',
  styleUrls: ['./options-field.component.scss']
})
export class OptionsFieldComponent implements ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() single: boolean = false;
  @Input() label: string;
  @Input() options: { option, label }[] = [];
  @Input() required: boolean;

  @Output() onChangesSelect: EventEmitter<any> = new EventEmitter();


  value: string[] = [];
  validatorId: string;

  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value): void {
    this.value = value;
  }

  registerOnChange(fn): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onTouched() {
    this.onTouchedFn();
  }

  isValue(option) {
    return Array.isArray(this.value) && this.value.findIndex((value: any) => value.value === option.value) !== -1;
  }

  setValue(e, option) {
    if (this.single) {
      this.value = e.value;
    } else if (e.checked) {
      if (Array.isArray(this.value)) {
        if (!this.value.find((v: any) => v.value === option.value)) this.value.push(option);
      } else {
        this.value = [option];
      }
    } else {
      const index = this.value.findIndex((value: any) => value.value === option.value.value);
      this.value.splice(index, 1);
    }

    this.onChangeFn(this.value);
    this.onTouchedFn();
  }

  private onChangeFn(value) { }
  private onTouchedFn() { }

}
