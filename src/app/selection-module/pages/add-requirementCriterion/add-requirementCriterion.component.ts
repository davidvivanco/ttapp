import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';
import { SelectionApiService } from '../../services/selection.api.services';
import { Requirement } from '../../interfaces/requirement';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';

@Component({
  selector: 'app-add-requirementCriterion',
  templateUrl: './add-requirementCriterion.component.html'
})
export class AddRequirementCriterionComponent implements OnInit, ComponentCanDeactivate {


  requirement: Requirement;
  criterionId: string;
  criterionTitle: string;
  requirementId: string;
  unsavedChanges = false;

  constructor(
    private route: ActivatedRoute,
    private _location: Location,
    private api: SelectionApiService,
    private router: Router) {
    this.requirementId = this.route.snapshot.paramMap.get('requirementId');
    this.criterionId = this.route.snapshot.paramMap.get('criterionId');
  }

  getRequirement(id: string) {
    this.api.getRequirementById(id).subscribe((requirement) => {
      this.requirement = requirement;
      if (this.criterionId !== 'add') {
        this.requirement.requirementCriteria.forEach(criterion => {
          if (criterion._id === this.criterionId) {
            this.criterionTitle = criterion.title;
          }
        });
      }
    });
  }

  ngOnInit() {
    this.getRequirement(this.requirementId);
  }

  goBack() {
    this.router.navigate([`seleccion/admin/baremaciones/${this.requirementId}`]);
  }

  setCriterionHasChanges(hasUnsavedChanges) {
    this.unsavedChanges = hasUnsavedChanges;
  }

  canDeactivate() {
    return !this.unsavedChanges;
  }

}
