import { NgOrganizationChartNodeModel } from '../ng-organization-chart-node-model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ng-organization-chart-list',
  templateUrl: './ng-organization-chart-list.component.html',
  styleUrls: ['./ng-organization-chart-list.component.scss']
})
export class NgOrganizationChartListComponent implements OnInit {

  @Input() nodeList: Array<NgOrganizationChartNodeModel> = [];
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
