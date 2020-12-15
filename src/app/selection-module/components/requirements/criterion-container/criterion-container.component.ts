import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RequirementCriterion } from '../../../interfaces/requirement';

@Component({
  selector: 'app-criterion-container',
  templateUrl: './criterion-container.component.html',
  styleUrls: ['./criterion-container.component.scss']
})
export class CriterionContainerComponent implements OnInit {

  @Input() requirementCriteria: Array<RequirementCriterion>
  @Input() hideDeleteButton: boolean
  @Input() hideEditButton: boolean
  @Input() title: string
  @Input() view: string

  @Output() onEditCriterion: EventEmitter<RequirementCriterion>;
  @Output() onDeleteCriterion: EventEmitter<number>;

  constructor() {
    this.onDeleteCriterion = new EventEmitter()
    this.onEditCriterion = new EventEmitter()
    this.requirementCriteria = [];
  }

  ngOnInit() {
  }

  deleteCriterion(index: number) {
    this.onDeleteCriterion.emit(index);
  }

  editCriterion(criterion: RequirementCriterion) {
    this.onEditCriterion.emit(criterion);
  }




}
