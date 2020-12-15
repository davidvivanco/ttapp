import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-decision-tree-field',
  templateUrl: './decision-tree-field.component.html',
  styleUrls: ['./decision-tree-field.component.scss']
})
export class DecisionTreeFieldComponent implements OnInit {
  @Input() level = 0;
  @Input() limit = 4;
  @Input() labelLabel = 'Label';
  @Input() valueLabel = 'Value';
  @Input() formArray = new FormArray([]);

  showChildren = false;

  constructor() { }

  ngOnInit() {
    if (!this.formArray.length) {
      this.addField();
    }
  }
  trackByFn(index, item) {
    return index; // or item.id
  }

  toggleTree(formGroup) {
    const hasTree = formGroup.get('tree');

    if (hasTree) {
      formGroup.removeControl('tree');
    } else {
      formGroup.addControl('tree', new FormArray([]));
    }

    this.showChildren = !hasTree;
  }

  toggleShowChildren() {
    this.showChildren = !this.showChildren;
  }

  addField() {
    this.formArray.insert(0, new FormGroup({
      label: new FormControl(''),
      value: new FormControl('')
    }));
  }

  removeField(i) {
    this.formArray.removeAt(i);
  }
}
