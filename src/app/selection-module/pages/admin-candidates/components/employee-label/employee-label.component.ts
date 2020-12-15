import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-employee-label',
  templateUrl: './employee-label.component.html'
})
export class EmployeeLabelComponent implements OnInit {

  @Input() user;
  private name: string;
  constructor() { }

  ngOnInit() {
    this.name = `${this.user.name} ${this.user.lastName}`;

  }

}
