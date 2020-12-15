import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { SelectionApiService } from '../../../services/selection.api.services';
import { CriterionModalComponent } from './modals/criterion/criterion-modal.component';
import { RequirementCriterion, Requirement } from '../../../interfaces/requirement';
import { LogsMessagesCommon, LogsMessagesCompetence } from '../../../../shared/models/logsMessages.interface';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { CombinationsModalComponent } from './modals/combinations/combinations-modal.component';

interface Block {
  _id: string,
  label: string,
  selected: boolean
}


@Component({
  selector: 'app-requirementCriteria',
  templateUrl: './requirementCriteria.component.html',
  styleUrls: ['./requirementCriteria.component.scss'],
})
export class RequirementCriteriaComponent implements OnInit {

  edit = false;
  title: string;
  showConfirmNoSavedChangesModal: boolean;
  blocks: Array<Block>;
  requirementCriterion: RequirementCriterion;
  requirementCriteria: Array<RequirementCriterion>
  requirementCriteriaIndexToUpdate: number
  combinationsToDelete: string[];
  formGroup: FormGroup;
  logsMessagesKeys: Array<string>
  logsMessagesTranslations: LogsMessagesCommon & LogsMessagesCompetence;
  dataAnnouncement;

  @Input() criterionId: string;
  @Input() requirement: Requirement;

  @ViewChild('addCriterionButton') addCriterionButton: HTMLButtonElement;
  @Output() thereIsChanges: EventEmitter<boolean> = new EventEmitter<boolean>();


  tsLiterals: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private api: SelectionApiService,
    public dialog: MatDialog,
    private _location: Location,
    private logsService: LogsService,
    private translate: TranslateService) {
    this.combinationsToDelete = [];
    this.logsMessagesKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.actionCantBeUndone',
      'logsMessages.common.changesNoSaved',
      'logsMessages.common.deleteAnyway',
      'logsMessages.common.returnWarning',
      'selectionAdmin.requirements.logsMessages.deleteCombinationsMessage',
      'selectionAdmin.requirements.logsMessages.deleteCombinationsTitle',
      'selectionAdmin.requirements.logsMessages.deleteCriterionMessage',
      'selectionAdmin.assessments.form.editFormula',
      'selectionAdmin.assessments.form.addFormula'
    ];
    this.showConfirmNoSavedChangesModal = false;
    this.getLogsTranslations();
    this.criterionId = this.route.snapshot.paramMap.get('id');
    this.api.getAllBlocks('curriculum').subscribe((blocks: any) => {
      this.blocks = blocks;
      this.blocks[0].selected = true;
    })
  }

  ngOnInit() {
    if (this.criterionId !== 'add') {
      this.setRequirementCriterionData();
      return;
    }
    this.createRequirementCriterionData();
    this.thereIsChanges.emit(false);
  }


  createRequirementCriterionData() {
    this.requirementCriteria = [];
    this.edit = false;
    this.requirementCriterion = { title: '', block: '', requirementCombinations: [], formula: {} };
    this.createForm(this.requirementCriterion);
    this.title = 'Nuevo criterio de valoración';
  }


  setRequirementCriterionData() {
    this.edit = true;
    this.requirementCriteriaIndexToUpdate = this.requirement.requirementCriteria.findIndex(criterion => criterion._id === this.criterionId);
    this.requirementCriterion = this.requirement.requirementCriteria[this.requirementCriteriaIndexToUpdate];
    this.requirementCriteria = [this.requirementCriterion];
    this.title = `Criterio ${this.requirementCriterion.title}`;
    this.createForm(this.requirementCriterion);
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesCompetence) => {
        this.logsMessagesTranslations = translations;
      });
  }

  updateRequirementCriterionAfterCreate(criterion) {
    this.requirementCriterion = { ...this.requirementCriterion, ...criterion };
    this.requirementCriteria = [this.requirementCriterion];
    this.requirement.requirementCriteria.push(this.requirementCriterion);
  }

  updateRequirementCriterionAfterEdit(criterion: RequirementCriterion) {
    this.requirementCriterion = { ...this.requirementCriterion, ...criterion };
    const index = this.requirement.requirementCriteria.findIndex(c => c._id === criterion._id);
    this.requirementCriteria[0] = this.requirementCriterion;
    this.requirement.requirementCriteria[index] = this.requirementCriterion;
    console.log('foo2', this.requirementCriterion);
  }

  updateRequirementInRunTime() {
    this.requirementCriterion.block = this.formGroup.value.block;
    this.requirementCriterion.title = this.formGroup.value.title;
  }

  updateRequirementInDataBase(body) {
    this.api.updateOneRequirement(this.requirement._id, body).subscribe(
      (requirement) => {
        const requirementCriterionIndex = requirement.requirementCriteria.findIndex(criteria => criteria._id === this.requirementCriterion._id);
        if (requirementCriterionIndex > -1) {
          this.requirementCriterion = requirement.requirementCriteria[requirementCriterionIndex];
          this.requirementCriteria = requirement.requirementCriteria;
        }

        this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
        this.requirement = requirement;
        this.thereIsChanges.emit(false);
        if (this.combinationsToDelete.length) this.deleteCombinations();

        if (this.criterionId === 'add') {
          const requirementCriterionId = this.requirement.requirementCriteria[this.requirement.requirementCriteria.length - 1]._id;
          this.router.navigate([`seleccion/admin/baremaciones/${this.requirement._id}/${requirementCriterionId}`]);
          this.criterionId = requirementCriterionId;
          this.setRequirementCriterionData();
        }
      }, (error => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
      })
    );
  }


  checkIfBlockHastoBeDesabled(block, formulasAlreadyUsed, blocksAlreadyUsed) {
    const index = blocksAlreadyUsed.findIndex(b => b === block._id);
    let formula;
    if (index > -1) {
      formula = formulasAlreadyUsed[index];
      if (formula === this.requirementCriterion.formula._id) block.disabled = true;
      else block.disabled = false;

    }
  }

  onBlockChange() {
    if (this.requirementCriterion.requirementCombinations.length) {
      this.openModalDeleteCombinations();
    }
  }

  cancel() {
    if (this.showConfirmNoSavedChangesModal) {
      this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'], message: this.logsMessagesTranslations['logsMessages.common.returnWarning'] } })
        .afterClosed().subscribe(cancel => {
          if (cancel) {
            this.goBack();
          }
        })
    } else {
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate([`seleccion/admin/baremaciones/${this.requirement._id}`]);
  }

  onSubmit() {
    this.updateRequirementInRunTime();
    this.updateRequirementInDataBase(this.requirement);
  }

  /* FORMGROUP */

  createForm(data): void {
    this.formGroup = this.formBuilder.group({
      title: [data.title, [Validators.required]],
      block: [data.block, [Validators.required]],
      requirementCombinations: [data.requirementCombinations, []]
    });


    this.formGroup.valueChanges.subscribe(val => {
      this.showConfirmNoSavedChangesModal = true;
      this.thereIsChanges.emit(true);
    });
  }

  getBlockValue(): string {
    return this.formGroup.get('block').value;
  }

  controlIsInvalid(control: string): boolean {
    return (this.formGroup && this.formGroup.touched && this.formGroup.invalid) || !this.formGroup.get('title').value;
  }


  /* MODALS */

  openModalAddCriterion() {
    this.dialog.open(CriterionModalComponent, {
      width: '800px',
      data: {
        requirement: this.requirement,
        block: this.formGroup.value.block,
        edit: false,
        titleModal: (this.edit) ? this.logsMessagesTranslations['selectionAdmin.assessments.form.editFormula'] : this.logsMessagesTranslations['selectionAdmin.assessments.form.addFormula'],
      },
      autoFocus: false
    }).afterClosed().subscribe(data => {
      if (data && !data.canceling) {
        this.updateRequirementCriterionAfterCreate(data.criterion);
        this.addCriterionButton.disabled = true;
        this.showConfirmNoSavedChangesModal = true;
      }
    });
  }


  openModalEditCriterion(criterion) {
    this.dialog.open(CriterionModalComponent, {
      width: '800px',
      data: {
        titleModal: this.logsMessagesTranslations['selectionAdmin.assessments.form.editFormula'],
        criterion,
        block: this.formGroup.value.block,
        edit: true,
        requirement: this.requirement
      },
      autoFocus: false
    }).afterClosed().subscribe(data => {
      // ACTUALIZAR CRITERIO
      if (data && !data.canceling) {
        this.updateRequirementCriterionAfterEdit(data.criterion);
        this.showConfirmNoSavedChangesModal = true;
      }
    });
  }


  openModalDeleteCriterion() {
    this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'],
        message: this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.deleteCriterionMessage']
      }
    })
      .afterClosed().subscribe(deleteCriterion => {
        if (deleteCriterion) {

          this.requirementCriteria = [];
          this.requirementCriterion.formula = {};
          this.showConfirmNoSavedChangesModal = true;
          this.requirementCriterion.requirementCombinations = [];

        }
      });
  }

  openModalAddCombination() {
    if (this.requirementCriterion.formula.type === 'exists') {
      this.dialog.open(CombinationsModalComponent, {
        data: {
          titleModal: 'Añadir criterio de valoración',
          block: this.getBlockValue(),
          edit: false,
          formula: this.requirementCriterion.formula,
          requirementCriterion: this.requirementCriterion
        },
        width: '800px',
        autoFocus: false
      }).afterClosed().subscribe((data) => {
        //AÑADIR CRITERIO
        if (data && !data.canceling) {
          this.requirementCriterion.requirementCombinations.push(data.data);
          this.showConfirmNoSavedChangesModal = true;
        }
      });
    }
    if (this.requirementCriterion.formula.type === 'conditionals') {
      this.router.navigate(['add'], { relativeTo: this.route, queryParams: { edit: false } });
    }
  }

  editCombination(requirementCombination, index) {
    this.dialog.open(CombinationsModalComponent, {
      data: {
        requirementCombination,
        edit: true,
        combinationId: requirementCombination._id,
        block: this.getBlockValue(),
        formula: this.requirementCriterion.formula,
        requirementCriterion: this.requirementCriterion
      },
      width: '800px',
      autoFocus: false
    }).afterClosed().subscribe(data => {
      if (data && !data.canceling) {
        this.requirementCriterion.requirementCombinations[index] = data.data;
        this.showConfirmNoSavedChangesModal = true;
      }
    });
  }

  editConditional(_, index) {
    this.router.navigate(['edit'], { relativeTo: this.route, queryParams: { conditionalIndex: index, edit: true } });
  }

  deleteCombination(index) {
    this.dialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'], message: this.logsMessagesTranslations['logsMessages.common.deleteAnyway'] } })
      .afterClosed().subscribe(deleteOk => {
        if (deleteOk) {
          const combination = this.requirementCriterion.requirementCombinations[index];
          if (combination._id) this.combinationsToDelete.push(combination._id);
          this.requirementCriterion.requirementCombinations.splice(index, 1);
          this.showConfirmNoSavedChangesModal = true;
        }
      });
  }

  deleteCombinations() {
    this.api.deleteCombinations(this.combinationsToDelete).subscribe(res => {
      if (res) this.combinationsToDelete = [];
    })
  }

  openModalDeleteCombinations() {
    this.dialog.open(DeleteConfirmationModalComponent, {
      data: {
        title: this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.deleteCombinationsTitle'],
        message: this.logsMessagesTranslations['selectionAdmin.requirements.logsMessages.deleteCombinationsMessage']
      }
    })
      .afterClosed().subscribe(deleteOk => {
        if (deleteOk) {
          this.requirementCriterion.requirementCombinations = [];
          this.showConfirmNoSavedChangesModal = true;
        }
      });
  }

}




