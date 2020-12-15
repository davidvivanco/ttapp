import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


interface ToogleOptions {
  type: string
  options: [
    {
      label: string,
      value: string
    }
  ]
}


@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent implements OnInit {
  index: number = 0;

  @Input() toogleOptions: ToogleOptions
  @Output() onToggle: EventEmitter<string | number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  toogle(e) {
    this.index = (this.index === 0) ? 1 : 0;
    this.onToggle.emit(this.toogleOptions.options[this.index].value)
  }

}
