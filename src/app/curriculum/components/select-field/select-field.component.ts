import { Component, Input, Self, Optional } from '@angular/core';
import { FormGroup, FormControl, FormArray, ControlValueAccessor, NgControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent implements ControlValueAccessor {
  @Input() disabled: boolean;
  @Input() optionsLabel = 'Options';
  @Input() labelLabel = 'Label';
  @Input() optionKeyLabel = 'Key';
  @Input() optionValueLabel = 'Value';
  @Input() errorMessage = 'At least one element is required';

  value: FormArray;
  

  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl,
    private formBuilder: FormBuilder
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value) {
    this.setValue(value);
  }

  private setValue(val?) {
    if(!Array.isArray(val)) {
      this.value = new FormArray([]);
    } else {
      this.value = new FormArray(val.map(item => this.formBuilder.group(item)));
    }

    this.onChangeFn(this.value)

    this.value.valueChanges.subscribe(this.onChange.bind(this));

    if(this.value.length === 0) {
      this.addOption();
    }
  }

  private onChange(val) {
    const newValue = val.map(({value, label}) => ({
      value: value ? value : label,
      label
    })).filter(item => !!(item.value && item.label));
    this.onChangeFn(newValue);
    this.onTouchedFn();
  }

  registerOnChange(fn) {
    this.onChangeFn = fn; 
  }

  registerOnTouched(fn) {
    this.onTouchedFn = fn;
  }
  
  ngOnInit() {
    
  }

  addOption() {
    this.value.push(new FormGroup({
      value: new FormControl(''),
      label: new FormControl(''),
    }))
  }

  removeOption(index: number) {
    this.value.removeAt(index);
  }

  private onChangeFn(value) {}
  private onTouchedFn() {}
}
