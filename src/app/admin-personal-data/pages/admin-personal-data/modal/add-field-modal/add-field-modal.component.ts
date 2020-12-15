import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService } from '../../../../../shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';


import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from '../../../../../shared/models/logsMessages.interface';

import { AdminPersonalDataApiService } from './../../../../services/admin-personal-data.api.service';


// Modal para editar la ficha de puesto
@Component({
  templateUrl: './add-field-modal.component.html',
  styleUrls: ['./add-field-modal.component.scss']
})
export class AddFieldModalComponent implements OnInit {
  config: any;
  formGroup: FormGroup;
  fieldsAvailables = [];
  schema;
  isSchemaCreated;
  slide;
  fromCreate = false;
  fromEdit = false;
  addEnabledLabel = false;
  addEnabledType = false;

  @ViewChild('positionSelect') positionSelect;
  public availablePositions: any[];
  public isAvailablePositionsLoaded: Promise<boolean>;
  cardPositionsMatChips = {};
  private logsMessagesKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private logsMessagesTranslations: LogsMessagesCommon; // Para delete mat chips sin afectar al padre hasta que guarde

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<AddFieldModalComponent>,
    private matDialog: MatDialog,
    private logsService: LogsService,
    private translate: TranslateService,
    public configurationService: ConfigurationService,
    public api: AdminPersonalDataApiService) {
    //dialogRef.disableClose = true;
    if (this.data) {
      this.isSchemaCreated = data.isSchemaCreated;
    }
    if (this.isSchemaCreated) {
      this.schema = data.schema;
    }
  }
  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.common.elementExists',
      'logsMessages.common.changesNoSaved',
      'logsMessages.personalData.editError',
      'logsMessages.personalData.addError',
      'logsMessages.personalData.duplicateTitleError',
      'genericMessages.text',
      'genericMessages.number',
      'genericMessages.date'
    ];
    this.getLogsTranslations();
    this.fieldsAvailables.push(
      { 'clave': 'text', 'valor': this.logsMessagesTranslations['genericMessages.text'] },
      { 'clave': 'number', 'valor': this.logsMessagesTranslations['genericMessages.number'] },
      { 'clave': 'date', 'valor': this.logsMessagesTranslations['genericMessages.date'] },
    );
    this.config = this.configurationService.getConfiguration();
    this.createForm();
    // control html add/edit buttons and editform get info
    if (this.data.fromCreate) {
      this.fromCreate = this.data.fromCreate;
    }
    if (this.data.elem) {
      this.fromEdit = this.data.fromEdit;
      this.formGroup = this.formBuilder.group({
        label: [this.data.elem.label, Validators.required],
        type: [this.data.elem.type, Validators.required],
        visibility: [this.data.elem.visibility, Validators.required]
      });
    }
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({ // para hacerlos editables simplemente quitar el parametro disabled
      label: ['', [Validators.required]],
      type: ['', [Validators.required]],
      visibility: [null, [Validators.required]]
    });
  }

  close(data?) {
    this.dialogRef.close(data);
  }

  addNewField() {
    let block = {};
    if (!this.isSchemaCreated) {
      block['order'] = 0;
      block['name'] = 'Personal Data';
      block['description'] = 'Admin Personal Data';
      block['fields'] = this.formGroup.value;
      this.api.createBlockPersonalData(block).subscribe(res => {
        if (res) this.close(res);
      }, err => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.addError']);
      });
    } else {
      if (this.formGroup.value.label !== '' && this.formGroup.value.type !== '') {
        if (this.data.titlesArr.includes(this.formGroup.value.label)) { // hay títulos repetidos?
          this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.duplicateTitleError']);
        } else {
          this.schema.blocks[0]['fields'].push(this.formGroup.value);
          this.api.editBlockPersonalData(this.schema.blocks[0], this.schema.blocks[0]._id).subscribe(res => {
            if (res) this.close(res);
          }, err => {
            this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.addError']);
          });
        }
      }
    }
  }

  editField() {
    this.data.titlesArr.splice(this.data.titlesArr.indexOf(this.data.elem.label), 1); // hay títulos repetidos?
    if (this.data.titlesArr.includes(this.formGroup.value.label)) {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.duplicateTitleError']);
    } else {
      let order = this.schema.blocks[0]['fields'].findIndex(elem => elem['_id'] === this.data.elem._id);
      this.schema.blocks[0]['fields'][order] = this.formGroup.value;
      this.api.editBlockPersonalData(this.schema.blocks[0], this.schema.blocks[0]._id).subscribe(
        res => {
          if (res) this.close(res);
        }, err => {
          this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.editError']);
        });

    }
  }

  onLabelChange(value: string) {
    this.addEnabledLabel = true;
  }

  typeOnChange() {
    this.addEnabledType = true;
  }
}
