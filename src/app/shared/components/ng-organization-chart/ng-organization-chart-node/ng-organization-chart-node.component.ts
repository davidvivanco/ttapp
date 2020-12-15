import { NgOrganizationChartNodeModel } from '../ng-organization-chart-node-model';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Employee } from '../../../models/employee.model';
import { UserService } from '../../../../shared/services/user.service';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { MatDialog } from '@angular/material';
import { InfoOrgModalComponent } from './modal/info-org-modal/info-org-modal.component';

@Component({
  selector: 'ng-organization-chart-node',
  templateUrl: './ng-organization-chart-node.component.html',
  styleUrls: ['./ng-organization-chart-node.component.scss']
})
export class NgOrganizationChartNodeComponent implements OnInit {

  @Input() node: NgOrganizationChartNodeModel;
  @Output() ClickNode: EventEmitter<NgOrganizationChartNodeModel> = new EventEmitter();
  // @Output() showCardPositionDetail: EventEmitter<CardPositions> = new EventEmitter(); // ti`par cuando mande card position
  @Output() showCardPositionDetail = new EventEmitter();
  @Output() showPersonalEmployeeDataDetail = new EventEmitter();

  permissions;
  user;

  public childrenStyleClass = 'vertical';
  public isChildrenVisible = true; // ver hijos
  showDetail = false;
  classHighlight = '';

  cardPosition;
  nodeEmployees: Employee[] = [];
  myEmployees = {}; // para lista de usuarios
  employeesList = []; // para ficha de puesto

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private translationsService: TranslationService,
    private dialog: MatDialog

  ) {
  }

  ngOnInit() {
    this.cardPosition = this.node;
    this.permissions = this.userService.getPermissions();
    this.user = this.userService.getUser();
    this.isMyEmployee(this.node);
    if ((this.cardPosition && this.cardPosition.highlight)) {
      this.classHighlight = 'highlight';
    }
  }

  isMyEmployee(node) { // objeto al vuelo para saber mis empleados
    node.people.forEach(p => {
      if (p && p.managers && p.managers.includes(this.user._id)) {
        this.myEmployees[p.id] = true;
        this.employeesList.push(p.id);
      } else {
        this.myEmployees[p.id] = false;
      }
    });
  }

  clickNode() {
    this.ClickNode.emit(this.node);
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

  infoModal() {
    this.dialog.open(InfoOrgModalComponent, {
      data: {
        people: this.cardPosition.people,
        permissions: this.permissions,
        userId: this.user.id,
        title: this.cardPosition.name,
        employees: this.myEmployees
      },
      width: '600px'
    });
  }
}
