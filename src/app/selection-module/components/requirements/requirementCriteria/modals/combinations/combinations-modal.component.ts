import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup } from '@angular/forms';

import { Formula } from '../../../../../interfaces/formula';
import { RequirementCombination } from '../../../../../interfaces/requirement';
import { LogsMessagesCommon } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { SelectionApiService } from '../../../../../services/selection.api.services';

@Component({
  selector: 'app-combinations-modal',
  templateUrl: 'combinations-modal.component.html',
  styleUrls: ['./combinations-modal.component.scss']
})
export class CombinationsModalComponent {
  loading = false;
  form: FormGroup;
  block: any;
  title: string;
  edit: boolean;
  logsMessagesKeys: Array<string>;
  combinations: Array<string>;
  blockId: string;
  mainValue: number;
  formula: Formula;
  requirementCombination: RequirementCombination;
  scoreUniqueFormula: boolean;
  logsMessagesTranslations: LogsMessagesCommon;

  constructor(
    private translate: TranslateService,
    private api: SelectionApiService,
    public dialogRef: MatDialogRef<CombinationsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.logsMessagesKeys = [
      'selectionAdmin.requirements.logsMessages.combination',
      'selectionAdmin.requirements.logsMessages.addCombination',
    ];
    this.getLogsTranslations();

  }

  ngOnInit() {
    this.setCombinations();
    this.scoreUniqueFormula = this.data.requirementCriterion.scoreUniqueFormula;
    this.blockId = this.data.block;
    this.formula = this.data.formula;
    this.mainValue = this.data.requirementCriterion.mainValue;
    this.edit = this.data.edit;


    this.title = (this.edit)
      ? `${this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.combination']} ${this.data.requirementCombination.title}`
      : `${this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.addCombination']}`;
    if (this.data.edit) {
      this.setRequirementCombination();
    }
  }

  setRequirementCombination() {
    if (this.data.combinationId) {
      this.api.getRequirementCombination(this.data.combinationId).subscribe(requirementCombination => {
        this.requirementCombination = requirementCombination;
      });
    } else {
      this.requirementCombination = this.data.requirementCombination;
    }

  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  close(canceling: boolean, data?: RequirementCombination): void {
    this.dialogRef.close({ data, canceling });
  }

  cancel() {
    this.close(true);
  }

  setCombinations() {
    this.combinations = this.data.requirementCriterion.requirementCombinations.map(e => e).map(e => e.combination.map(c => c.requirement));
  }

  submitForm(requirementCombination: RequirementCombination) {
    const data = this.buildDataToSubmit(requirementCombination)
    this.close(false, data);
  }

  buildDataToSubmit(requirementCombination): RequirementCombination {
    const data: any = { combination: [] };
    Object.keys(requirementCombination).forEach(key => {
      if (key !== 'title' && key !== 'combinationValue') {
        data.combination.push({
          fieldId: key,
          ...requirementCombination[key]
        });
      }
    });
    data.title = requirementCombination.title;
    data.combinationValue = requirementCombination.combinationValue;

    return data;
  }

  changeRol(event) { }

  changeLevel(event) { }
}
