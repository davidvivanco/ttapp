import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

interface Filter {
  id: string;
  label: string;
  name: string;
  options: Array<{ name: string, value: string }>;
}

@Component({
  selector: 'app-global-filter',
  templateUrl: './global-filter.component.html',
  styleUrls: ['./global-filter.component.scss']
})
export class GlobalFilterComponent implements OnInit {
  formGroup: FormGroup;
  filterSelected = false;
  @Input() filters: Filter[];
  @Input() set resetForm(value: boolean) {
    if (value) this.createForm();
  }
  @Output() applyFilters: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    const controls = {};
    this.filters.forEach(filter => {
      controls[filter.id] = [[], []];
    });


    this.formGroup = this.formBuilder.group(controls);
  }

  filter(removeFilters = false) {
    if (removeFilters) {
      this.createForm();
      this.applyFilters.emit(this.formGroup.value);
      this.filterSelected = false;

    } else {
      this.applyFilters.emit(this.formGroup.value);
      this.filterSelected = true;
    }
  }


}
