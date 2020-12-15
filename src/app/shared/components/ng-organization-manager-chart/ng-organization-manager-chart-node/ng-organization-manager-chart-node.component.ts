import { NgOrganizationManagerChartNodeModel } from '../ng-organization-manager-chart-node-model';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Employee } from '../../../models/employee.model';
import { UserService } from '../../../../shared/services/user.service';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { CardPosition } from 'src/app/shared/models/card-position.model';

@Component({
  selector: 'ng-organization-manager-chart-node',
  templateUrl: './ng-organization-manager-chart-node.component.html',
  styleUrls: ['./ng-organization-manager-chart-node.component.scss']
})
export class NgOrganizationManagerChartNodeComponent implements OnInit {

  @Input() node: NgOrganizationManagerChartNodeModel;
  @Output() ClickNode: EventEmitter<NgOrganizationManagerChartNodeModel> = new EventEmitter();
  @Output() showCardPositionDetail: EventEmitter<CardPosition> = new EventEmitter(); // ti`par cuando mande card position
  // @Output() showCardPositionDetail = new EventEmitter();
  @Output() showPersonalEmployeeDataDetail = new EventEmitter();


  permissions;
  user;

  public childrenStyleClass = 'horizontal';
  public isChildrenVisible = true; // ver hijos
  showDetail = false;
  classHighlight = '';

  cardPosition;
  nodeEmployees: Employee[] = [];
  myEmployees = {}; // para ficha de puesto y datos personales

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private translationsService: TranslationService) {
  }

  ngOnInit() {
    this.cardPosition = this.node;
    this.permissions = this.userService.getPermissions();
    this.user = this.userService.getUser();
    if ((this.node.id === this.user.id)) {
      this.classHighlight = 'highlight';
    }
    this.isMyEmployee(this.node);
  }

  clickNode() {
    this.ClickNode.emit(this.node);
  }

  isMyEmployee(node) { // objeto al vuelo para saber mis empleados
    if (node && node.managers && node.managers.includes(this.user._id)) {
      this.myEmployees[node.id] = true;
    } else {
      this.myEmployees[node.id] = false;
    }
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

  hideChildren() {
    this.isChildrenVisible = false;
  }

  showChildren() {
    this.isChildrenVisible = true;
  }
}
