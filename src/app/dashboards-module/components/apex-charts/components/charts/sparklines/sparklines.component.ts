import { Component, Input, OnInit } from '@angular/core';
import { Col } from '../../../interfaces/dashboard';

import { ChartOptionsType } from '../../../types/chartOptions';

@Component({
  selector: 'app-sparklines',
  templateUrl: './sparklines.component.html',
  styleUrls: ['./sparklines.component.scss']
})
export class SparklinesComponent implements OnInit {
  chartOptions: Partial<ChartOptionsType>
  @Input() chart: Col;

  constructor() {

  }

  ngOnInit() {

  }

}
