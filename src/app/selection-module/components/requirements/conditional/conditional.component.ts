import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

interface TreeNode {
  id: number;
  type: string;
  label: string;
  options: any;
  optionSelected: string | Array<string>;
  tree: any;
  required: boolean;
  level: number;
  childNumber: number;
  result: number;
  children?: TreeNode[];
}

@Component({
  selector: 'app-conditional',
  templateUrl: './conditional.component.html',
  styleUrls: ['./conditional.component.scss']
})
export class ConditionalComponent implements OnInit {
  formGroup: FormGroup;
  rangeDate: Array<Date>;
  resultFormGroup: FormGroup;
  show: boolean;
  currently: boolean;

  @Input() node: TreeNode;
  @Input() nodesArray: Array<TreeNode>;

  @Output() addConditions = new EventEmitter();
  @Output() deleteConditions = new EventEmitter();
  @Output() modifyConditions = new EventEmitter();
  @Output() insertNodeResult = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.show = true;
    this.rangeDate = [];
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({});
    if (this.node.type === 'text') {
      this.formGroup.addControl('textFormControl', new FormControl('', [Validators.required]));
    } else if (this.node.type === 'number') {
      this.formGroup.addControl('numberFormControl', new FormControl('', [Validators.required]));
    } else if (this.node.type === 'select' || this.node.type === 'radio') {
      this.formGroup.addControl('selectFormControl', new FormControl('', [Validators.required]));
    } else if (this.node.type === 'date') {
      this.formGroup.addControl('dateFormControl', new FormControl('', [Validators.required]));
    } else if (this.node.type === 'checkbox') {
      this.formGroup.addControl('checkboxFormControl', new FormControl('', [Validators.required]));
    } else if (this.node.type === 'decisionTree') {
      this.formGroup.addControl('treeFormControl', new FormControl('', [Validators.required]));
    }
    if (this.node.type === 'dateRange') {
      this.formGroup.addControl('startDateRange', new FormControl('', [Validators.required]));
      this.formGroup.addControl('endDateRange', new FormControl('', [Validators.required]));
    }
    this.resultFormGroup = new FormGroup({});
    this.resultFormGroup.addControl(this.node.id.toString(), new FormControl('', [Validators.required]));
  }

  changeOptionSelected(selection) {
    this.modifyConditions.emit({ selectedValue: selection.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  branchSelected(branch) {
    this.modifyConditions.emit({ selectedValue: branch.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  changeMultipleOptionSelected(multipleSelection) {
    this.modifyConditions.emit({ selectedValue: multipleSelection.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  setNumberInput(event) {
    this.modifyConditions.emit({ selectedValue: event.target.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  setTextInput(event) {
    this.modifyConditions.emit({ selectedValue: event.target.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  setDateValue(event) {
    this.modifyConditions.emit({ selectedValue: event.value, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  setRangeDataValue(index, event) {
    this.rangeDate[index] = event.value;
    this.modifyConditions.emit({ selectedValue: this.rangeDate, level: this.node.level, childNumber: this.node.childNumber, id: this.node.id });
  }

  currentlySwitch() {
    this.currently = !this.currently;
    if (this.currently) this.rangeDate[1] = new Date();
  }

  addCondition() {
    this.addConditions.emit({ level: this.node.level, childNumber: this.node.childNumber });
  }

  addResult() {
    this.show = true;
    this.insertNodeResult.emit({ result: 1, level: this.node.level, id: this.node.id });
  }

  deleteCondition() {
    this.deleteConditions.emit({ level: this.node.level, id: this.node.id });
  }

  deleteResult() {
    this.show = false;
    this.insertNodeResult.emit({ result: null, level: this.node.level, id: this.node.id });
  }

  setResult(event) {
    this.insertNodeResult.emit({ result: event.target.value, level: this.node.level, id: this.node.id });
  }

  checkType(field) {
    const type = typeof field;
    return type;
  }
}
