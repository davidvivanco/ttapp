import { Component, Input, Output, ViewChild, Self, Optional, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

interface TreeValue {
  label: string;
  value: string;
  tree: TreeValue[]
}



@Component({
  selector: 'app-nested-menu',
  templateUrl: './nested-menu.component.html',
  styleUrls: ['./nested-menu.component.scss']
})
export class NestedMenuComponent implements ControlValueAccessor {

  private value: string[] = [];
  @ViewChild('childMenu') public childMenu;

  @Input() tree: TreeValue[];
  @Input() path = '';
  @Input() onChangeFn = (value) => { };

  @Output() onBranchSelected: EventEmitter<{ value: string, label: string }> = new EventEmitter();

  constructor(
    @Self()
    @Optional()
    private ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  selectLeaf(branch) {
    this.onBranchSelected.emit(branch)
    if (branch._id) this.value.push(branch._id)
    this.onTouchedFn();
  }


  branchSelected(branch) {
    this.onBranchSelected.emit(branch)

  }



  writeValue(value) {
    this.value = Array.isArray(value) ? [...value] : [];
  }

  registerOnChange(fn) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn) {
    this.onTouchedFn = fn;
  }

  private onTouchedFn() { }
}
