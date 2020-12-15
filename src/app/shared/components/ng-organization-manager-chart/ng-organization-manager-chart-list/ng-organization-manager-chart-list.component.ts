import { NgOrganizationManagerChartNodeModel } from '../ng-organization-manager-chart-node-model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ng-organization-manager-chart-list',
  templateUrl: './ng-organization-manager-chart-list.component.html',
  styleUrls: ['./ng-organization-manager-chart-list.component.scss']
})
export class NgOrganizationManagerChartListComponent implements OnInit {

  @Input() nodeList: Array<NgOrganizationManagerChartNodeModel> = [];
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
