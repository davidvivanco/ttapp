import { Component, Inject, Output, EventEmitter } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ApiService } from 'src/app/shared/services/api.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Block } from '../../../../../../curriculum/classes/block';
import { NotifyService } from 'src/app/common/services/notify.service';

import { FileUploader } from 'ng2-file-upload';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';
import { LogsMessagesCommon } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

import { MY_FORMATS } from 'src/app/globals';
import { CurriculumApiService } from 'src/app/curriculum/services/curriculum.api.service';
import { Employee } from 'src/app/shared/models/employee.model';

@Component({
  selector: 'app-add-component-modal',
  templateUrl: 'add-component-modal.component.html',
  styleUrls: ['./add-component-modal.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddComponentModalComponent {

  @Output() onBack = new EventEmitter();


  blocks: Block[] = [];
  loading = false;
  block: Block;
  form: FormGroup = new FormGroup({});
  blockSelected: Block;
  aux: {};
  dataFilled;
  employeeId;
  editing = false;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesCommon;

  public uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  progressBarMode: ('determinate' | 'query');
  urlUpload = `${this.apiService.endpoint}/curriculums/uploadFile/`;

  constructor(
    public apiService: ApiService,
    private userService: UserService,
    public dialogRef: MatDialogRef<AddComponentModalComponent>,
    private api: CurriculumApiService,
    @Inject(MAT_DIALOG_DATA) public data,
    private notify: NotifyService,
    private translate: TranslateService,
    private logsService: LogsService,
    private dateAdapter: DateAdapter<Date>
  ) {
    // console.log('Modal data', data);
    this.translationsKeys = [
      'logsMessages.common.saveSuccess',
      'logsMessages.common.errorOccurred',
    ];
    this.getTranslations();
    this.block = JSON.parse(JSON.stringify(data.block));
    if (data.fillData !== undefined) {
      this.dataFilled = data.fillData;
      this.regroupData();
      this.editing = true;
    }

    this.setForm();
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: this.urlUpload,
        queueLimit: 1,
        method: 'PUT',
        headers: requestHeaders
      }
    );
    this.hasBaseDropZoneOver = false;
    this
      .progressBarMode = 'determinate';

    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }
  uploadFile() {
    this.uploader.uploadAll();
    this.uploader.onCompleteAll = () => {
      this.dialogRef.close(true);
    };
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations;
      });
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  close(): void {
    this.dialogRef.close();
  }

  regroupData() {
    this.block.blockId = this.block._id;
    this.block._id = this.dataFilled._id;
    this.dataFilled.fields.map(f => {
      this.block.fields.forEach(elementB => {
        if (elementB._id === f.fieldId) {
          elementB.value = f.value;
          elementB.fieldId = f.fieldId;
          elementB.type = f.type;
        }
      });
    });
  }

  setForm() {
    this.form = new FormGroup({});
    this.block.fields.forEach((field: any) => {
      const validators = [];
      if (field.validation && field.validation.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'file') {
        this.form.addControl(field._id, new FormControl(field.fileUrl, validators));
      } else {
        this.form.addControl(field._id, new FormControl(field.value, validators));
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }
    this.loading = true;
    const data: any = Object.entries(this.form.value).filter(([key, value]) => !!value).map(([id, value]) => {
      return { fieldId: id, value };
    });
    this.block.fields.forEach(f => {
      data.forEach(dataElement => {
        if (dataElement.fieldId === f._id) {
          dataElement.type = f.type;
        }
      });
    });

    // Paso decisionTree a String
    data.forEach(dataF => {
      if (dataF.type.toString() === 'decisionTree' && Array.isArray(dataF.value)) {
        dataF.value = dataF.value.join('>');
      }
    });

    if (this.editing) {
      this.employeeId = this.data.employee;
      this.api.updateCurriculumPublished({ ...this.block, fields: data }, this.employeeId).subscribe(

        (res: any) => {
          this.loading = false;
          this.logsService.log(this.translations['logsMessages.common.saveSuccess']);
          if (res.fieldId) {
            this.uploader.setOptions({ url: this.urlUpload + `&blockId=${res.blockId}&fieldId=${res.fieldId}` });
            this.uploadFile();
          } else {
            // console.log('cierro dialogo');
            this.dialogRef.close(res);
          }
        },
        () => this.handleError()
      );
    } else {
      this.employeeId = this.data.employee;
      data.blockId = this.block._id;
      this.block['blockId'] = this.block._id;
      delete this.block._id;

      this.api.updateCurriculum({ ...this.block, fields: data }, this.employeeId).subscribe(
        (res: any) => {
          this.loading = false;
          this.logsService.log(this.translations['logsMessages.common.saveSuccess']);
          if (res.fieldId) {
            this.uploader.setOptions({ url: this.urlUpload + `&blockId=${res.blockId}&fieldId=${res.fieldId}` });
            this.uploadFile();
          } else {
            this.dialogRef.close(res);
          }
        },
        () => this.handleError()
      );
    }

  }

  markAllAsTouched() {
    (<any>Object).values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  handleError() {
    this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
  }
}
