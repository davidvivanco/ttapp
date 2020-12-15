import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-exists',
  templateUrl: './exists.component.html'
})
export class ExistsComponent implements OnInit {
  formGroup: FormGroup;
  uniqueFormula: boolean;
  @Output() onIsValid = new EventEmitter();
  @Input() showGlobalValue;

  @Input() mainValue: number
  @Input() maxValue: number
  @Input('scoreUniqueFormula')
  set resetForm(uniqueFormula: boolean) {
    this.uniqueFormula = uniqueFormula;
    if (this.formGroup) {
      this.createForm();
      this.onIsValid.emit(this.formGroup);
    }
  }
  @Input() isConditional: boolean

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  onInput(e) {
    this.onIsValid.emit(this.formGroup)
  }

  createForm(): void {
    if (!this.isConditional) {
      this.formGroup = this.formBuilder.group({
        mainValue: [this.mainValue, (this.uniqueFormula) ? [Validators.required, Validators.min(1)] : []],
        maxValue: [this.maxValue, [Validators.required, Validators.min(1)]],
      });
    } else {
      this.formGroup = this.formBuilder.group({
        maxValue: [this.maxValue, [Validators.required, Validators.min(1)]],
      });
    }
   
  }

}
