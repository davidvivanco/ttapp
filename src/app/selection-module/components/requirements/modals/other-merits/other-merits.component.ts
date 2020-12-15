import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectionApiService } from '../../../../services/selection.api.services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Requirement } from '../../../../interfaces/requirement';

@Component({
  selector: 'app-other-merits',
  templateUrl: './other-merits.component.html',
  styleUrls: ['./other-merits.component.scss']
})
export class OtherMeritsComponent implements OnInit {
  formGroup: FormGroup;
  edit: boolean;
  allMertis: OtherMerits[];
  meritSelected: OtherMerits;
  requirement: Requirement;

  constructor(
    private api: SelectionApiService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<OtherMeritsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.getAllMerits();
    this.requirement = this.data.requirement as Requirement;
  }

  getAllMerits() {
    this.api.getOtherMerits().subscribe(res => {
      this.allMertis = res;
      if (this.data && this.data.merit) {
        this.edit = true;
        this.meritSelected = this.allMertis.find(m => m.type === this.data.merit.meritType);
      }
      this.createForm(this.meritSelected);
      if (this.meritSelected) {
        this.meritSelected.inputs.forEach(input => {
          this.formGroup.addControl(input.id, new FormControl(this.data.merit[input.id]));
          if (input.required) this.formGroup.controls[input.id].setValidators(Validators.required);
        });
      }
    });
  }

  createForm(data?: any): void {
    this.formGroup = this.formBuilder.group({
      merit: [data ? data : '', [Validators.required]]
    });
  }

  changeMerit(event) {

    const merit: OtherMerits = event.value;
    this.createForm(merit);

    console.log('merit', this.formGroup.value);
    if (merit) {
      this.addControlsToForm(merit);
    }
    this.meritSelected = merit;
  }


  addControlsToForm(merit) {
    merit.inputs.forEach(input => {
      this.formGroup.addControl(input.id, new FormControl(''));
      if (input.required) this.formGroup.controls[input.id].setValidators(Validators.required);
    });
  }


  onInput() {

  }

  close() {
    this.dialogRef.close({ canceling: true });
  }

  saveData() {
    const data = Object.assign({}, this.formGroup.value);
    data.meritType = this.formGroup.value.merit.type;
    delete data.merit;
    this.dialogRef.close({ merit: data, edit: (this.edit), canceling: false });
  }

  alreadyUsed(merit): boolean {
    return (this.requirement.otherMerits)
      ? this.requirement.otherMerits.some(m => m.meritType === merit.type)
      : false;
  }

}
