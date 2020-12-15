import { NgOrganizationManagerChartNodeModel } from './ng-organization-manager-chart-node-model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ng-organization-manager-chart',
  templateUrl: './ng-organization-manager-chart.component.html',
  styleUrls: ['./ng-organization-manager-chart.component.scss']
})
export class NgOrganizationManagerChartComponent implements OnInit {

  @Input() data: Array<NgOrganizationManagerChartNodeModel> = [];
  @Input() remoteData = false;
  @Input() employee;
  @Output() ClickNode: EventEmitter<NgOrganizationManagerChartNodeModel> = new EventEmitter();
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
