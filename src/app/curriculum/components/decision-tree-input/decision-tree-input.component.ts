import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, FormControl, Validators } from '@angular/forms';
import get from 'lodash/get';
import set from 'lodash/set';



interface TreeValue {
  value: string;
  label: string;
  tree?: TreeValue[];
}


@Component({
  selector: 'app-decision-tree-input',
  templateUrl: './decision-tree-input.component.html',
  styleUrls: ['./decision-tree-input.component.scss']
})
export class DecisionTreeInputComponent implements ControlValueAccessor {
  static TIMEOUT_ONCHANGE = 1000;
  @Input() rows = 3;
  @Input() label = 'Pega aqui el contenido de la plantilla modificado';
  value = new FormControl('', [Validators.required]);
  touched = false;


  private timeoutId: number;

  private onChangeFn: Function = () => { };
  private onTouchedFn: Function = () => { };

  constructor(
    @Self()
    @Optional()
    private ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.value.valueChanges.subscribe(this.onChange.bind(this));
  }

  writeValue(value) {

  }

  onChange(text) {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      let valueToEmit;

      if (!text) {
        this.value.setValue('', { emitEvent: false });
        valueToEmit = '';
      } else {
        valueToEmit = this.processText(text);
      }
      this.onChangeFn(valueToEmit);
      this.onTouchedFn();

    }, DecisionTreeInputComponent.TIMEOUT_ONCHANGE);
  }

  registerOnChange(fn: Function) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn) {
    this.onTouchedFn = fn;
  }

  private processText(text: string): TreeValue[] {
    const tree = [];
    const rows = text.split('\n');

    rows.forEach((row) => {
      const columns = row.split('\t');
      let path = '';
      let tmpTree;
      columns.forEach((column, level) => {
        if (path) {
          tmpTree = get(tree, path);
          if (!tmpTree) {
            tmpTree = [];
            set(tree, path, tmpTree);
          }
        } else {
          tmpTree = tree;
        }
        let branchIndex = tmpTree.findIndex(i => i.value === column);
        if (branchIndex < 0) {
          tmpTree.push({ value: column, label: column });
          branchIndex = tmpTree.length - 1;
        }
        if (level !== (columns.length - 1)) {
          path += (path ? '.' : '') + `${branchIndex}.tree`;
        }
      });
    });

    return tree;
  }
}
