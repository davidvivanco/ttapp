import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Requirement, RequirementCriterion } from '../../../../../interfaces/requirement';
import { SelectionApiService } from '../../../../../services/selection.api.services';

@Component({
  selector: 'app-requirement-modal',
  templateUrl: './requirement-modal.component.html'
})
export class RequirementOfferModalComponent implements OnInit {
  title: string;
  requirementCriteria: Array<RequirementCriterion>;
  displayedColumns: string[] = ['name'];


  constructor(
    public dialogRef: MatDialogRef<RequirementOfferModalComponent>,
    private api: SelectionApiService,
    @Inject(MAT_DIALOG_DATA) public data: { requirement: Requirement }
  ) {
  }

  ngOnInit() {
    this.title = 'Baremo ' + this.data.requirement.title;
    this.api.getRequirementCriteria(this.data.requirement._id).subscribe((requirementCriteria: Array<RequirementCriterion>) => {
      this.requirementCriteria = requirementCriteria;
    });
  }


  close(): void {
    this.dialogRef.close();
  }
}
