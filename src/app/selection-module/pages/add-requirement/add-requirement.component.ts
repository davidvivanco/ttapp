import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionApiService } from '../../services/selection.api.services';
import { Requirement } from '../../interfaces/requirement';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';
import { MatDialog } from '@angular/material';
import { OtherMeritsComponent } from '../../components/requirements/modals/other-merits/other-merits.component';

@Component({
  selector: 'app-add-requirement',
  templateUrl: './add-requirement.component.html'
})
export class AddRequirementComponent implements OnInit, ComponentCanDeactivate {

  requirement: Requirement;
  requirementId: string;
  edit: boolean;
  openOtherCriterionModal: boolean;
  showAddRequirementButton: boolean;
  unsavedChanges = false;
  setRequirement: Requirement;
  constructor(
    private router: Router,
    private api: SelectionApiService,
    private route: ActivatedRoute,
    private _location: Location,
    public dialog: MatDialog) {
    this.requirementId = this.route.snapshot.paramMap.get('requirementId');
    this.showAddRequirementButton = false;
  }

  ngOnInit() {
    if (this.requirementId !== 'add') {
      this.getRequirement(this.requirementId);
      this.showAddRequirementButton = true;
      this.edit = true;
    } else {
      this.edit = false;
      this.requirement = {
        title: '',
        description: '',
        valuations: [],
        requirementCriteria: []
      };
    }
  }

  requirementUpdated(requirement: Requirement) {
    this.requirement = requirement;
  }

  goBack() {
    if (this._location.path() !== 'seleccion/admin/baremaciones/add') {
      this.router.navigate(['seleccion/admin/baremaciones/'], { state: { data: { disabled: true, edit: true } } });
    } else {
      this._location.back();
    }
  }

  updateUrl(requirement: Requirement) {
    this.showAddRequirementButton = true;
    this.edit = true;
    this.router.navigate([`seleccion/admin/baremaciones/${requirement._id}`], { state: { data: { disabled: true, edit: true } } });
  }

  getRequirement(requirementId: string) {
    this.api.getRequirementById(requirementId).subscribe((requirement) => {
      this.requirement = requirement;
    });
  }

  addRequirementCriteria() {
    this.router.navigate(['add'], { relativeTo: this.route, state: { data: { disabled: true, edit: true } } });
  }

  setRequirementHasChanges(hasUnsavedChanges) {
    this.unsavedChanges = hasUnsavedChanges;
  }

  canDeactivate() {
    return !this.unsavedChanges;
  }

  addOtherCriterionModal() {
    this.dialog.open(OtherMeritsComponent, {
      width: '800px',
      data: { requirement: this.requirement }
    }).afterClosed().subscribe(data => {
      if (data && !data.canceling) {
        if (!this.requirement.otherMerits) {
          this.requirement.otherMerits = [data.merit];
        } else this.requirement.otherMerits.push(data.merit);
        this.setRequirement = this.requirement;
      }

    });
  }

}
