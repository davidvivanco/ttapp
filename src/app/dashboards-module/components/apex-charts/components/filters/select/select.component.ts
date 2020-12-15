import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface Filter {
  optionSelected: string;
  options: [
    {
      label: string,
      value: string
    }
  ];
}



@Component({
  selector: 'app-select',
  templateUrl: './select.component.html'
})
export class SelectComponent implements OnInit {

  @Input() filter: Filter;
  @Output() onFilterChange: EventEmitter<string>;

  constructor() {
    this.onFilterChange = new EventEmitter();
  }

  ngOnInit() {
  }

  filterChange(e) {

    this.onFilterChange.emit(e.value);
  }

}
