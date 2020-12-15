import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Requirement } from '../../../interfaces/requirement';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesCompetence } from '../../../../shared/models/logsMessages.interface';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { OtherMeritsComponent } from '../modals/other-merits/other-merits.component';
import { createTranslateLoader } from '../../../../admin-surveys/admin-surveys.module';


@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.scss'],
})
export class RequirementComponent implements OnInit {
  title: string;
  logsMessagesKeys: Array<string>;
  logsMessagesTranslations: LogsMessagesCommon & LogsMessagesCompetence;
  showConfirmNoSavedChangesModal: boolean;
  formGroup: FormGroup;
  meritsToDelete: string[];
  criteriaToDelete: string[];

  @Input() edit: boolean;
  @Input() requirement: Requirement;
  @Input() set setRequirement(requirement: Requirement) {
    if (requirement) {
      requirement._id = this.requirement._id;
      this.requirement = requirement;
    }
  }
  @Output() onRequirementCreated: EventEmitter<Requirement>;
  @Output() thereIsChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() requirementUpdated: EventEmitter<Requirement> = new EventEmitter<Requirement>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private api: SelectionApiService,
    private logsService: LogsService,
    public dialog: MatDialog,
    private _location: Location,
    private translate: TranslateService,
    private matDialog: MatDialog,
  ) {
    this.meritsToDelete = [];
    this.criteriaToDelete = [];
    this.onRequirementCreated = new EventEmitter();
    this.logsMessagesKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.actionCantBeUndone',
      'logsMessages.common.changesNoSaved',
      'logsMessages.common.deleteAnyway',
      'logsMessages.common.returnWarning'
    ];
    this.showConfirmNoSavedChangesModal = false;
    this.getLogsTranslations();
  }

  ngOnInit() {
    this.title = this.requirement.title;
    this.createForm(this.requirement);
  }


  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesCompetence) => {
        this.logsMessagesTranslations = translations;
      });
  }

  createForm(data): void {
    this.formGroup = this.formBuilder.group({
      title: [data.title, [Validators.required]],
      description: [data.description, []],
      requirementCriteria: [data.requirementCriteria, []],
    });

    this.formGroup.valueChanges.subscribe(val => {
      this.showConfirmNoSavedChangesModal = true;
      this.thereIsChanges.emit(true);
    });

  }

  editElement(element, disabled, edit = false) {
    this.router.navigate([element._id], { relativeTo: this.route, state: { data: { disabled: disabled, edit: edit } } });
  }

  deleteCriterion(index) {
    this.matDialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'], message: this.logsMessagesTranslations['logsMessages.common.deleteAnyway'] } })
      .afterClosed().subscribe(deleteCriterion => {
        if (deleteCriterion) {
          const criteria = this.requirement.requirementCriteria[index];
          if (criteria._id) this.criteriaToDelete.push(criteria._id);
          this.requirement.requirementCriteria.splice(index, 1);
          this.thereIsChanges.emit(true);
        }
      });

  }

  editCriterion(criterion) {
    this.editElement(criterion, false, true);
  }

  onSubmit() {
    this.requirement = { ...this.requirement, ...this.formGroup.value };

    (!this.edit)
      ? this.addRequirement()
      : this.updateOneRequirement();

  }

  updateOneRequirement() {
    this.api.updateOneRequirement(this.requirement._id, this.requirement).subscribe((requirement: Requirement) => {
      this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
      this.requirementUpdated.emit(requirement);
      if (this.meritsToDelete.length) this.deleteMerits();
      if (this.criteriaToDelete.length) this.deleteCriteria();
      this.thereIsChanges.emit(false);

    }, (error: Error) => {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
    });
  }

  addRequirement() {
    this.api.addRequirement(this.requirement).subscribe((requirement: Requirement) => {
      this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
      this.requirement._id = requirement._id;
      this.edit = true;
      this.thereIsChanges.emit(false);
      this.onRequirementCreated.emit(this.requirement);
    }, (error: Error) => {
      // console.info([error.message]);
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']);
    });
  }

  goBack() {
    this._location.back();
  }

  cancel() {
    if (this.showConfirmNoSavedChangesModal) {
      this.matDialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'], message: this.logsMessagesTranslations['logsMessages.common.returnWarning'] } })
        .afterClosed().subscribe(cancel => {
          if (cancel) {
            this.goBack();
          }
        });
    } else {
      this.goBack();
    }
  }

  public checkError = (controlName: string, errorName: string) => {
    return this.formGroup.controls[controlName].hasError(errorName);
  }

  editMerit(merit: Partial<OtherMerits>, index) {
    this.matDialog.open(OtherMeritsComponent, { width: '800px', data: { merit, requirement: this.requirement } })
      .afterClosed().subscribe(data => {
        if (data && !data.canceling) {
          this.requirement.otherMerits[index] = { ...this.requirement.otherMerits[index], ...data.merit }
        }
      });
  }

  deleteMerit(index: number) {
    this.matDialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.actionCantBeUndone'], message: this.logsMessagesTranslations['logsMessages.common.deleteAnyway'] } })
      .afterClosed().subscribe(deleteMerit => {
        if (deleteMerit) {
          const meritToDelete = this.requirement.otherMerits[index];
          this.requirement.otherMerits.splice(index, 1);
          this.thereIsChanges.emit(true);
          if (meritToDelete._id) this.meritsToDelete.push(meritToDelete._id);
        }
      });
  }

  deleteMerits() {
    this.api.deleteMerits(this.meritsToDelete).subscribe(res => {
      this.meritsToDelete = [];
    });

  }

  deleteCriteria() {
    this.api.deleteCriteria(this.criteriaToDelete).subscribe(res => {
      this.criteriaToDelete = [];
    });

  }


}
