import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html'
})
export class SurveysComponent implements OnInit {

  private readonly typeDashboard: string;

  constructor() {
    this.typeDashboard = 'survey';
  }

  ngOnInit() {
  }

}
