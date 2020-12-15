import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Employee } from 'src/app/shared/models/employee.model';

@Component({
  selector: 'app-visibility-filter',
  templateUrl: './visibility-filter.component.html'
})

export class VisibilityFilterComponent implements OnInit {
  @Input() user: Employee;
  @Output() filterByVisibilityEvent: EventEmitter<string>;

  constructor() {
    this.filterByVisibilityEvent = new EventEmitter();
  }

  ngOnInit() {
  }

  filterByVisibility(e) {
    this.filterByVisibilityEvent.emit(e.value);
  }

}
