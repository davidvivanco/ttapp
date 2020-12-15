import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Requirement } from '../../interfaces/requirement';
import { SelectionApiService } from '../../services/selection.api.services';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { LogsService } from '../../../shared/services/shared-services/logs.service';

interface TreeNode {
  id: number;
  type: string;
  label: string;
  options: any;
  optionSelected: string | Array<string>;
  tree: any;
  required: boolean;
  level: number;
  childNumber: number;
  result: number;
  children?: TreeNode[];
}

@Component({
  selector: 'app-add-requirement-criterion-valoration',
  templateUrl: './add-requirement-criterion-valoration.component.html',
  styleUrls: ['./add-requirement-criterion-valoration.component.scss']
})
export class AddRequirementCriterionValorationComponent implements OnInit {
  requirement: Requirement;
  criterionId: string;
  criterionTitle: string;
  requirementId: string;
  title: string;
  logsMessagesKeys: Array<string>;
  logsMessagesTranslations: any;
  tsLiterals: any;
  formGroup: FormGroup;
  curriculums: any;
  curriculumBlocks: any;
  criterion: any;
  blockIndex: number;
  countId: number;
  countChild: number;
  treeOptions: Array<string>;
  nodeArr: Array<TreeNode>;
  referenceNode: TreeNode;
  childNode: TreeNode;
  conditionalIndex: number;
  edit: boolean;
  editableCriterion: TreeNode;
  blockData: any;

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();
  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  constructor(
    private route: ActivatedRoute,
    private _location: Location,
    private api: SelectionApiService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private logsService: LogsService
  ) {
    this.requirementId = this.route.snapshot.paramMap.get('requirementId');
    this.criterionId = this.route.snapshot.paramMap.get('criterionId');
    this.logsMessagesKeys = [
      'selectionAdmin.valuations.conditional.title',
      'selectionAdmin.valuations.conditional.selectError',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.errorOccurred',
      'selectionAdmin.valuations.conditional.writeNumber',
      'selectionAdmin.valuations.conditional.chooseOption',
      'surveysAdmin.form.placeholders.startDate',
      'surveysAdmin.form.placeholders.finishDate',
      'selectionAdmin.valuations.conditional.chooseDate',
      'selectionAdmin.valuations.conditional.chooseMultipleOptions',
      'selectionAdmin.valuations.conditional.writeText'
    ];
    const TREE_DATA: TreeNode[] = [];
    this.dataSource.data = TREE_DATA;
    this.blockIndex = 0;
    this.blockData = { type: [], label: [], options: [], tree: [] };
    this.countId = 0;
    this.countChild = 0;
    this.treeOptions = [];
    this.nodeArr = [];
    this.edit = false;
    this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
    this.treeControl.dataNodes = [];
  }

  ngOnInit() {
    this.getLogsTranslations();
    this.route
      .queryParams
      .subscribe(params => {
        if (params.edit === 'true') {
          this.edit = true;
          this.conditionalIndex = params.conditionalIndex;
          this.getRequirement(this.requirementId, params.conditionalIndex);
        } else {
          this.title = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.title'];
          this.getRequirement(this.requirementId);
        }
      });
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: any) => {
        this.logsMessagesTranslations = translations;
      });
  }

  getRequirement(id: string, conditionalIndex?) {
    this.api.getRequirementById(id).subscribe((requirement) => {
      this.requirement = requirement;
      this.getCriterion(this.criterionId, conditionalIndex);
      this.createForm();
    });
  }

  getCriterion(criterionId, conditionalIndex?) {
    const myCriterion = this.requirement.requirementCriteria.find(criterion => criterion._id === criterionId);
    if (myCriterion) {
      this.criterionTitle = myCriterion.title;
      this.criterion = myCriterion;
      this.getCurriculumBlocks(conditionalIndex);
      if (conditionalIndex) {
        this.title = myCriterion.requirementCombinations[conditionalIndex].title;
      }
    }
  }

  goBack() {
    this._location.back();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      title: [this.edit ? this.title : '', [Validators.required]],
      tree: []
    });
  }

  getCurriculumBlocks(conditionalIndex?) {
    this.api.getSchema().subscribe(data => {
      this.curriculums = data;
      this.curriculums.blocks.forEach((block: any) => {
        if (block._id === this.criterion.block) {
          this.curriculumBlocks = block.fields.filter(item => item.type !== 'header' && item.type !== 'file');
          this.getCurriculumBlockData();
          this.initializeTree(conditionalIndex);
        }
      });
    });
  }

  getCurriculumBlockData() {
    this.curriculumBlocks.forEach((block, index) => {
      this.blockData.type[index] = block.type;
      this.blockData.label[index] = block.label;
      this.blockData.options[index] = block.options;
      this.blockData.tree[index] = block.tree;
    });
  }

  initializeTree(conditionalIndex?) {
    if (conditionalIndex) {
      this.editableCriterion = this.criterion.requirementCombinations[conditionalIndex].combination[0];
      this.dataSource.data[0] = this.editableCriterion;
      this.rebuildNodeArray(this.editableCriterion);
      this.treeControl.dataNodes = this.nodeArr;
      this.referenceNode = this.nodeArr[0];
      this.treeControl.expandAll();
      this.refreshTree();
    } else {
      this.referenceNode = this.createNode(true, 0);
      this.saveNode(this.referenceNode);
      this.dataSource.data.push(this.referenceNode);
      this.refreshTree();
    }
  }

  createNode(isRequired, childNumber) {
    const node = {
      id: this.countId,
      type: this.blockData.type[this.blockIndex],
      label: this.blockData.label[this.blockIndex],
      options: this.blockData.options[this.blockIndex],
      optionSelected: this.switchTypeComponent(this.blockData.type[this.blockIndex]),
      tree: this.blockData.tree[this.blockIndex],
      required: isRequired,
      level: this.blockIndex,
      childNumber: childNumber,
      result: null,
      children: []
    };
    return node;
  }

  switchTypeComponent(typeComponent) {
    let selection;
    switch (typeComponent) {
      case 'number':
        selection = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.writeNumber'];
        break;
      case 'select':
      case 'radio':
      case 'decisionTree':
        selection = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.chooseOption'];
        break;
      default:
        break;
      case 'date':
        selection = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.chooseDate'];
        break;
      case 'dateRange':
        selection = [this.logsMessagesTranslations['surveysAdmin.form.placeholders.startDate'],
        this.logsMessagesTranslations['surveysAdmin.form.placeholders.finishDate']];
        break;
      case 'checkbox':
        selection = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.chooseMultipleOptions'];
        break;
      case 'text':
        selection = this.logsMessagesTranslations['selectionAdmin.valuations.conditional.writeText'];
        break;
    }
    return selection;
  }

  rebuildNodeArray(tree) {
    this.nodeArr.push(tree);
    if (tree.children.length !== 0) {
      tree.children.forEach(child => {
        this.rebuildNodeArray(child);
      });
    }
  }

  saveNode(node) {
    this.nodeArr.push(node);
  }

  setEditionParemeters() {
    if (this.referenceNode.children.length === 0) {
      this.countChild = 0;
    } else {
      const childLong = this.referenceNode.children.length;
      const lastChild = this.referenceNode.children[childLong - 1];
      this.countChild = lastChild.childNumber + 1;
    }
    const nodeArrLong = this.nodeArr.length;
    const lastId = this.nodeArr[nodeArrLong - 1].id;
    this.countId = lastId + 1;
  }

  setChildNode() {
    this.blockIndex = this.referenceNode.level + 1;
    this.childNode = this.createNode(false, this.countChild);
  }

  checkReferenceNodeLength() {
    if (this.referenceNode.children.length === 0) this.countChild = 0;
  }

  increaseCountChild() {
    if (!this.conditionalIndex) this.countChild++;
  }

  addNode(event) {
    this.getReferenceNode(event);
    this.checkReferenceNodeLength();
    this.conditionalIndex ? this.setEditionParemeters() : this.countId++;
    this.setChildNode();
    switch (this.blockData.type[event.level + 1]) {
      case 'text':
      case 'date':
      case 'dateRange':
      case 'number':
      case 'checkbox':
        this.getReferenceNode(event);
        this.referenceNode.children.push(this.childNode);
        this.saveNode(this.childNode);
        this.increaseCountChild();
        break;
      case 'select':
      case 'radio':
        if (this.countChild < this.childNode.options.length) {
          this.getReferenceNode(event);
          this.referenceNode.children.push(this.childNode);
          this.saveNode(this.childNode);
          this.increaseCountChild();
        }
        break;
      case 'decisionTree':
        this.flatTreeDecision(this.childNode.tree);
        this.treeOptions = this.treeOptions.filter(elem => elem !== '');
        if (this.countChild < this.treeOptions.length) {
          this.getReferenceNode(event);
          this.referenceNode.children.push(this.childNode);
          this.saveNode(this.childNode);
          this.increaseCountChild();
        }
        break;
      default:
        break;
    }
    this.refreshTree();
  }

  modifyNode(event) {
    const parent = this.getParentNode(event);
    if (event.level === 0) parent.optionSelected = event.selectedValue;
    else {
      parent.children.forEach(child => {
        if (Array.isArray(child.optionSelected)) {
          if (child.optionSelected.length === event.selectedValue.length && child.optionSelected.every(item => event.selectedValue.includes(item))) {
            this.logsService.logError(this.logsMessagesTranslations['selectionAdmin.valuations.conditional.selectError']);
          }
        } else {
          if (child.optionSelected === event.selectedValue) {
            this.logsService.logError(this.logsMessagesTranslations['selectionAdmin.valuations.conditional.selectError']);
          }
        }
      });
      parent.children[event.childNumber].optionSelected = event.selectedValue;
    }
  }

  getReferenceNode(event) {
    this.referenceNode = this.nodeArr.find(node => node.level === event.level && node.childNumber === event.childNumber);
  }

  getParentNode(event) {
    let parentNode;
    if (event.level === 0) parentNode = this.nodeArr[0];
    else {
      const posibleParents = this.nodeArr.filter(node => node.level === event.level - 1);
      posibleParents.forEach(parent => {
        parent.children.forEach(child => {
          if (child.id === event.id) parentNode = parent;
        });
      });
    }
    return parentNode;
  }

  removeNode(event) {
    const nodeIndex = this.nodeArr.findIndex(node => node.level === event.level && node.id === event.id);
    this.nodeArr.splice(nodeIndex, 1);
    this.lookOverNodes(this.dataSource.data[0], event);
    this.refreshTree();
  }

  lookOverNodes(node, event) {
    if (node.children.length !== 0) {
      node.children.forEach(child => {
        child.level === event.level ? this.deleteChild(node, event) : this.lookOverNodes(child, event);
      });
    }
  }

  deleteChild(node, event) {
    node.children = node.children.filter(item => item.id !== event.id);
  }

  setNodeResult(event) {
    const nodeIndex = this.nodeArr.findIndex(node => node.level === event.level && node.id === event.id);
    this.nodeArr[nodeIndex].result = event.result;
  }

  refreshTree() {
    const _data = this.dataSource.data;
    this.dataSource.data = null;
    this.dataSource.data = _data;
  }

  flatTreeDecision(arr) {
    arr.forEach(item => {
      item.tree ? this.flatTreeDecision(item.tree) : this.treeOptions.push(item.value);
    });
  }

  cancel() {
    this.goBack();
  }

  onSubmit() {
    if (this.conditionalIndex) {
      this.criterion.requirementCombinations[this.conditionalIndex].combination[0] = this.dataSource.data[0];
    } else {
      let conditional = {};
      conditional = {
        title: this.formGroup.value.title,
        block: this.requirementId,
        requirementCriterionId: this.criterionId,
        combination: this.dataSource.data[0],
      };
      this.criterion.requirementCombinations.push(conditional);
    }
    this.updateRequirementInDataBase(this.requirement);
  }

  updateRequirementInDataBase(body) {
    this.api.updateOneRequirement(this.requirement._id, body).subscribe(
      (requirement: Requirement) => {
        this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
        this.requirement = requirement;
      }, (error => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
      })
    );
  }
}
