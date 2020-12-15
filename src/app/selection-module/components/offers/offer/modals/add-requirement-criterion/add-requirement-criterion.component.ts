import { Component, OnInit, Inject } from '@angular/core';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { Requirement } from '../../../../../interfaces/requirement';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-requirement-criterion',
  templateUrl: './add-requirement-criterion.component.html',
  styleUrls: ['./add-requirement-criterion.component.scss']
})
export class AddRequirementCriterionModalComponent implements OnInit {
  requirements: Array<Requirement>
  requirementSelected: Requirement
  displayedColumns: string[] = ['name', 'actions'];

  constructor(
    private api: SelectionApiService,
    public dialogRef: MatDialogRef<AddRequirementCriterionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {

  }

  ngOnInit() {
    this.api.getAllRequirements().subscribe((requirements: Array<Requirement>) => {
      this.requirements = requirements;
    })
  }

  submit(requirement: Requirement) {
    this.requirementSelected = requirement;
    this.close(false);
  }

  close(canceling?: boolean): void {
    this.dialogRef.close({ canceling, requirement: this.requirementSelected },);
  }

  cancel() {
    this.close(true);
  }


}
