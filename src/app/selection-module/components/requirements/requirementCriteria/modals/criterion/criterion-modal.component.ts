import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RequirementCriterion } from 'src/app/selection-module/interfaces/requirement';
import { Formula } from '../../../../../interfaces/formula';
import { SelectionApiService } from '../../../../../services/selection.api.services';
import { CommonFunctions } from '../../../../../../commonFunctions';
import { Requirement } from '../../../../../interfaces/requirement';
import { DeleteConfirmationModalComponent } from '../../../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { LogsMessagesCommon, LogsMessagesCompetence } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-criterion-modal',
  templateUrl: 'criterion-modal.component.html'
})
export class CriterionModalComponent {
  loading: boolean;
  canceling: boolean;
  edit: boolean;
  formulaFormIsValid: boolean;
  formGroup: FormGroup;
  title: string;
  mainValue: number;
  maxValue: number;
  formulas: Array<(Formula & { selected?: boolean, disabled?: boolean })>;
  requirementCriterion: RequirementCriterion;
  requirement: Requirement;
  logsMessagesTranslations: LogsMessagesCommon & LogsMessagesCompetence;
  logsMessagesKeys: Array<string>;

  constructor(
    public dialogRef: MatDialogRef<CriterionModalComponent>,
    private formBuilder: FormBuilder,
    private commonFunctions: CommonFunctions,
    public dialog: MatDialog,
    private translate: TranslateService,
    private api: SelectionApiService,
    @Inject(MAT_DIALOG_DATA) public data) {
    if (!data) throw new Error('Data is not supplied');
    this.loading = false;
    this.edit = false;
    this.canceling = false;
    this.requirement = data.requirement;
    this.getFormulas();
    this.logsMessagesKeys = [
      'selectionAdmin.requirements.logsMessages.updateMainValueTitle',
      'selectionAdmin.requirements.logsMessages.updateMainValueMessage',
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesCompetence) => {
        this.logsMessagesTranslations = translations;
      });
  }

  setRequirementCriterion() {
    this.title = this.data.titleModal;
    if (this.data.edit) {
      this.edit = true;
      this.requirementCriterion = this.commonFunctions.clone(this.data.criterion);
      this.formulaFormIsValid = true;
    } else {
      this.requirementCriterion = {
        formula: {
          _id: null,
          label: null,
          type: null
        },
        block: this.data.block,
        allMeritsScore: false,
        mainValue: null,
        maxValue: null,
        scoreUniqueFormula: false,
        requirementCombinations: []
      };
    }
    this.mainValue = this.requirementCriterion.mainValue;
    this.maxValue = this.requirementCriterion.maxValue;
  }

  createForm(data?: RequirementCriterion): void {
    this.formGroup = this.formBuilder.group({
      formula: [(this.data.edit) ? this.data.criterion.formula._id : '', [Validators.required]],
      scoreUniqueFormula: [data.scoreUniqueFormula, [Validators.required]],
      allMeritsScore: [data.allMeritsScore, [Validators.required]]
    });
  }

  buildControlForms() {
    const existsControls = ['scoreUniqueFormula', 'allMeritsScore'];
    switch (this.requirementCriterion.formula.type) {
      case 'exists':
        existsControls.forEach(control => {
          this.formGroup.controls[control].setValidators([Validators.required]);
        });
        break;
      case 'conditionals':
        existsControls.forEach(control => {
          this.formGroup.controls[control].clearValidators();
        });
        break;
      default:
        break;
    }
  }

  close(canceling?: boolean): void {
    switch (this.requirementCriterion.formula.type) {
      case 'exists':
        this.requirementCriterion.maxValue = this.maxValue;
        this.requirementCriterion.mainValue = this.mainValue;
        break;
      case 'conditionals':
        this.requirementCriterion.maxValue = this.maxValue;
        break;
      default:
        break;
    }
    this.dialogRef.close({ canceling, criterion: this.requirementCriterion },);
  }

  saveData() {
    this.close(false);
  }

  changeFormula(event) {
    if (!event.value) return;
    const formula = this.formulas.find(f => f._id === event.value);
    this.requirementCriterion.formula = formula;
    this.buildControlForms();
  }

  getFormulas() {
    this.api.getFormulas().subscribe((formulas: Array<Formula>) => {
      this.formulas = formulas;
      this.setRequirementCriterion();
      this.checkAviabilityFormulas();
      this.createForm(this.requirementCriterion);
    })
  }

  setScoreUniqueFormula() {
    this.requirementCriterion.scoreUniqueFormula = !this.requirementCriterion.scoreUniqueFormula;
    if (this.requirementCriterion.scoreUniqueFormula && this.requirementCriterion.requirementCombinations.length) {
      this.openModalUpdateCombinationValue();
    } else {
      this.formGroup.controls['scoreUniqueFormula'].setValue(this.requirementCriterion.scoreUniqueFormula);
    }
  }

  setAllMeritsScore() {
    this.requirementCriterion.allMeritsScore = !this.requirementCriterion.allMeritsScore;
    this.formGroup.controls['allMeritsScore'].setValue(this.requirementCriterion.allMeritsScore);
  }

  checkFormulaForm(formulaForm: any) {
    this.formulaFormIsValid = formulaForm.valid;
    switch (this.requirementCriterion.formula.type) {
      case 'exists':
        this.mainValue = formulaForm.value.mainValue;
        this.maxValue = formulaForm.value.maxValue;
        break;
      case 'conditionals':
        this.maxValue = formulaForm.value.maxValue;
        break;
      default:
        break;
    }
  }

  checkAviabilityFormulas() {
    this.formulas.forEach(formula => {
      const formulasUsedWithThisBlock = this.data.requirement.requirementCriteria
        .filter(e => e.block === this.data.block).map(e => e.formula._id);

      if (formulasUsedWithThisBlock.includes(formula._id)) {
        formula.disabled = true;
      }
    })
  }

  getFomulaValue(): string {
    return this.formGroup.get('formula').value
  }

  openModalUpdateCombinationValue() {
    this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.updateMainValueTitle'], message: this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.updateMainValueMessage'] } })
      .afterClosed().subscribe(res => {
        if (res) {
          this.formGroup.controls['scoreUniqueFormula'].setValue(this.requirementCriterion.scoreUniqueFormula);
          this.requirementCriterion.requirementCombinations.forEach(combination => {
            combination.combinationValue = this.requirementCriterion.mainValue;
          })
        } else {
          this.requirementCriterion.scoreUniqueFormula = !this.requirementCriterion.scoreUniqueFormula;
          this.formGroup.controls['scoreUniqueFormula'].setValue(this.requirementCriterion.scoreUniqueFormula);
        }
      })
  }
}
