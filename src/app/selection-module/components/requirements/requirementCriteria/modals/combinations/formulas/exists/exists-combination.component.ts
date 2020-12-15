import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CombinationsModalComponent } from '../../combinations-modal.component';
import { SelectionApiService } from '../../../../../../../services/selection.api.services';
import { RequirementCombination } from '../../../../../../../interfaces/requirement';

@Component({
  selector: 'app-exists-combination',
  templateUrl: './exists-combination.component.html',
  styleUrls: ['./exists-combination.component.scss']
})
export class ExistsCombinationComponent implements OnInit {
  form: FormGroup;
  block: any;
  combinationBusy: boolean;

  @Input() blockId: string;
  @Input() combinations: Array<Array<string>>;
  @Input() scoreUniqueFormula: string;
  @Input() edit: boolean;
  @Input() mainValue: number;
  @Input() requirementCombination: RequirementCombination;

  @Output() onCancel = new EventEmitter();
  @Output() onSubmit = new EventEmitter();



  constructor(
    public dialogRef: MatDialogRef<CombinationsModalComponent>,
    private api: SelectionApiService) {
  }


  ngOnInit() {

    this.api.getOneBlock('curriculum', this.blockId).subscribe((res: any) => {
      this.block = res.block;
      if (this.requirementCombination) this.setForm(this.requirementCombination);
      else this.createForm();
    });

  }


  branchSelected(branch, index: number) {
    this.block.fields[index].branchSelected = branch.label;

    this.form.controls[this.block.fields[index]._id].reset({
      requirement: branch._id,
      value: branch.value,
      label: branch.label
    });
  }

  setForm(data) {
    this.form = new FormGroup({});
    this.form.addControl('title', new FormControl(data.title, Validators.required));
    this.form.addControl('combinationValue', new FormControl((this.scoreUniqueFormula) ? this.mainValue : data.combinationValue, Validators.required));
    if (this.scoreUniqueFormula) this.form.controls['combinationValue'].disable();
    data.combination.forEach(element => {
      const fieldIndex = this.block.fields.findIndex(field => field._id === element.fieldId);
      if (fieldIndex > -1) {
        this.block.fields[fieldIndex].branchSelected = element.label;
      }
      if (this.block.fields[fieldIndex].type === 'radio') {
        const optionIndex = this.block.fields[fieldIndex].options.findIndex(option => option._id === element.requirement);

        if (optionIndex > -1) {
          this.block.fields[fieldIndex].options[optionIndex].selected = true;
        }
      }
      this.form.addControl(element.fieldId, new FormControl(element, Validators.required));
    });

    this.form.valueChanges.subscribe(controls => {
      const combinations = this.getCombination(controls);
      this.checkCombinationIsBusy(combinations);
    });
  }

  compareFunction(option, value): boolean {
    return option.requirement === value.requirement;
  }

  createForm() {
    this.form = new FormGroup({});
    this.form.addControl('title', new FormControl('', Validators.required));
    this.form.addControl('combinationValue', new FormControl((this.scoreUniqueFormula) ? this.mainValue : '', Validators.required));
    if (this.scoreUniqueFormula) this.form.controls['combinationValue'].disable();

    this.block.fields.forEach((field: any) => {
      const validators = [];
      validators.push(Validators.required);

      if (field.type === 'select' || field.type === 'radio') {
        const option = field.options.filter(opt => opt.value === field.value);
        let controlValue;
        if (field.type === 'select') {
          controlValue = option.length
            ? { value: option[0].value, requirement: option[0]._id }
            : undefined;
        } else if (field.type === 'radio') controlValue = option.length ? option[0] : undefined;

        this.form.addControl(field._id, new FormControl(controlValue, validators));
      }
      if (field.type === 'decisionTree') {
        this.form.addControl(field._id, new FormControl(field.value, validators));
      }
    });

    this.form.valueChanges.subscribe(controls => {
      const combinations = this.getCombination(controls);
      this.checkCombinationIsBusy(combinations);
    });

  }

  getCombination(controls): Array<string> {
    return Object.values(controls)
      .filter(control => typeof control === 'object' && control !== null)
      .map((control: any) => control.requirement);
  }

  checkCombinationIsBusy(combination): void {
    this.combinationBusy = false;
    if (this.combinations.length && combination.length === this.combinations[0].length) {
      for (const c of this.combinations) {
        const arrTemp = [...c, ...combination];
        if (Array.from(new Set(arrTemp)).length === combination.length) {
          this.combinationBusy = true;
        }
      }
    }
  }

  submitForm() {
    this.onSubmit.emit(this.form.getRawValue());
  }

  cancel() {
    this.onCancel.emit(true);
  }

}
