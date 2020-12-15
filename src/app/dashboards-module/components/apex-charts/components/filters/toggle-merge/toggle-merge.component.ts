import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggle-merge',
  templateUrl: './toggle-merge.component.html',
  styleUrls: ['./toggle-merge.component.scss']
})
export class ToggleMergeComponent implements OnInit {

  @Input() row;
  @Output() onToggle: EventEmitter<number> = new EventEmitter();
  index: number = 0;
  checked: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

  toogle(e) {
    this.index = (e.checked) ? 1 : 0;
    this.checked = (e.checked);
    this.onToggle.emit(this.index);
  }

}
