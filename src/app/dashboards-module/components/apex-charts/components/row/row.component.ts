import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss']
})
export class RowComponent implements OnInit {

  @Input() row;
  @Input() index: number;
  @Input() desc: string;
  @Input() dashboard: any;

  filter;
  toggleActive: boolean;
  _label: string;

  constructor() {
    this.toggleActive = false;
  }

  ngOnInit() {
    if (this.row.slider) this.setLabel(this.row.slider.sliderOptions.value)
    if (this.row.select) this.setLabel(this.row.optionSelected.daysGrouped)
  }

  filterChange(e, chart) {
    this.filter = e;
    this.setLabel(e);
  }

  sliderChange(e) {
    this.setLabel(e);
    this.filter = e;
  }

  setLabel(value) {
    if (value === 1) this._label = 'Último día.'
    else this._label = `Últimos ${value} días`
  }

  toggle(e) {
    this.filter = e;
    this.setLabel(e);
  }

  get label() {
    return this._label;
  }


}
