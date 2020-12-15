import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CurriculumApiService } from '../../services/curriculum.api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';

@Component({
  selector: 'app-field-modal',
  templateUrl: './field-modal.component.html',
  styleUrls: ['./field-modal.component.scss']
})
export class FieldModalComponent implements OnInit {
  fields = [
    {label: 'Texto', value: 'text'},
    {label: 'Número', value: 'number'},
    {label: 'Header', value: 'header'},
    {label: 'Select', value: 'select'},
    {label: 'Radio', value: 'radio'},
    {label: 'Checkbox', value: 'checkbox'},
    {label: 'Fecha', value: 'date'},
    {label: 'Rango de Fecha', value: 'dateRange'},
    {label: 'Arbol de Decisión', value: 'decisionTree'},
    {label: 'Archivo Adjunto', value: 'file'}
  ];

  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  newField: true;
  fieldFileExists = false;

  form = new FormGroup({
    label: new FormControl('', [Validators.required]),
    type: new FormControl('text', [Validators.required])
  });

  constructor(
    private dialogRef: MatDialogRef<FieldModalComponent>,
    private formBuilder: FormBuilder,
    private api: CurriculumApiService,
    private logsService: LogsService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    if (data.fileFound) {
      this.fieldFileExists = data.fileFound;
    }
  }

  private static downloadFile(data: any) {
    const blob = new Blob([data], { type: 'application/ms-excel' });
    const file = new File([blob], 'templateTree.xlsx', { type: 'application/vnd.ms.excel' });
    saveAs(file);
  }

  ngOnInit() {
    if (this.data && this.data.field && this.data.field.type) {
      this.form.get('type').setValue(this.data.field.type);
      this.form.get('label').setValue(this.data.field.label);
    }
    this.checkFields();
    this.form.get('type').valueChanges.subscribe(this.checkFields.bind(this));

    this.translationsKeys = [
      'logsMessages.users.downloadExcelTemplate',
      'logsMessages.common.downloadTemplateSuccess',
      'logsMessages.common.downloadError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  private checkFields() {
    this.checkValidation();
    this.checkOptions();
    this.checkTree();
  }

  private checkTree() {
    const type = this.form.get('type').value;

    if (type === 'decisionTree') {
      this.form.addControl('tree', new FormControl('', [Validators.required]));
    } else {
      this.form.removeControl('tree');
    }
  }

  private checkOptions() {
    const type = this.form.get('type').value;

    if (['select', 'checkbox', 'radio'].includes(type)) {
      let options = (this.data && this.data.field && this.data.field.options) || [];
      this.form.addControl('options', new FormControl(options, [Validators.required]));
    } else {
      this.form.removeControl('options');
    }
  }

  private checkValidation() {
    const type = this.form.get('type').value;

    if (type === 'header') {
      this.form.removeControl('validation');
    } else {
      const validation = (this.data && this.data.field && this.data.field.validation) || {};
      const { required = false, visible = false } = validation;
      this.form.addControl('validation', this.formBuilder.group({ required, visible }));
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.markAsTouched();
    }
  }

  markAsTouched() {
    Object.values(this.form.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  isOptions() {
    const type = this.form.get('type').value;
    return ['select', 'radio', 'checkbox'].includes(type);
  }

  downloadTreeExcelTemplate() {
    let blockId: string;
    let fieldId: string;
    if (this.data.blockId && this.data.field) {
      blockId = this.data.blockId;
      fieldId = this.data.field._id;
    }
    this.logsService.logLoading(this.translations['logsMessages.users.downloadExcelTemplate']);
    this.api.getTreeExcelTemplate(blockId, fieldId).subscribe(excelFile => {
      if (excelFile) {
        FieldModalComponent.downloadFile(excelFile);
        this.logsService.log(this.translations['logsMessages.common.downloadTemplateSuccess']);
      } else {
        this.logsService.logError(this.translations['logsMessages.common.downloadError']);
      }
    }, (err) => {
      this.logsService.logError(this.translations['logsMessages.common.downloadError']);
    });
  }

}
