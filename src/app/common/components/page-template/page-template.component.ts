import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-template',
  templateUrl: './page-template.component.html',
  styleUrls: ['./page-template.component.scss']
})
export class PageTemplateComponent {
  @Input() breadcrumb: string[];
  @Input() addButton: string;
  @Input() loading: boolean = false;
  @Output() onAdd: EventEmitter<null> = new EventEmitter();

  constructor() { }

  onClickAdd() {
    this.onAdd.emit(null);
  }
}
