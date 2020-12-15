import { NgOrganizationChartNodeModel } from './ng-organization-chart-node-model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ng-organization-chart',
  templateUrl: './ng-organization-chart.component.html',
  styleUrls: ['./ng-organization-chart.component.scss']
})
export class NgOrganizationChartComponent implements OnInit {

  @Input() data: Array<NgOrganizationChartNodeModel> = [];
  @Input() remoteData = false;
  @Input() employee;
  @Output() ClickNode: EventEmitter<NgOrganizationChartNodeModel> = new EventEmitter();
  @Output() showCardPositionDetail = new EventEmitter();
  @Output() showPersonalEmployeeDataDetail = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
  
  openCardPositionModal(node) {
    this.showCardPositionDetail.emit(node);
  }

  openPersonalEmployeeDataDetail(node) {
    this.showPersonalEmployeeDataDetail.emit(node);
  }
  onClickDeepNode(node) {
    this.ClickNode.emit(node);
  }

}
