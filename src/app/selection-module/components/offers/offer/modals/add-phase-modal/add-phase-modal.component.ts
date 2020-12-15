import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ApiService } from 'src/app/shared/services/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';
import { UserService } from 'src/app/shared/services/user.service';
import { MY_FORMATS } from 'src/app/globals';

@Component({
  selector: 'app-add-phase-modal',
  templateUrl: 'add-phase-modal.component.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddPhaseModalComponent {

  loading;
  formGroup: FormGroup;
  title: string;
  fileName: string;
  editing: boolean;
  readonly: boolean;
  minDate: Date;
  maxDate: Date;
  uploader: FileUploader;
  urlUpload = `${this.apiService.endpoint}/offers/uploadFile/`;
  hasBaseDropZoneOver: boolean;
  progressBarMode: ('determinate' | 'query');
  types = [
    ['feePayment', 'Pago de tasas'],
    ['test', 'Examen o Prueba'],
    ['provideDocumentation', 'Aportar Documentación'],
    ['results', 'Publicación Resultados'],
    ['others', 'Otros']
  ];

  @ViewChild('fileInput') fileInput;


  constructor(
    public dialogRef: MatDialogRef<AddPhaseModalComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private userService: UserService,
    public apiService: ApiService,
    private dateAdapter: DateAdapter<Date>) {
    this.readonly = false;
    this.loading = false;
    this.editing = false;

    if (data && data.titleModal) {
      this.title = data.titleModal;
    }

    if (data && data.phase) {
      this.createForm(data.phase);
      (this.title)
        ? this.title += '"' + data.phase.title + '"'
        : this.title = data.phase.title;
    } else {
      this.createForm();
    }
    if (data && data.readonly) { // cambio [readonly] en cada elemento del formulario que parece que no desactiva por esto
      this.readonly = data.readonly;
      this.formGroup.disable();
    }

    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);

    this.uploader = new FileUploader(
      {
        url: this.urlUpload + data.id + '/phases',
        queueLimit: 1,
        method: 'PUT',
        headers: requestHeaders
      }
    );

    this.hasBaseDropZoneOver = false;
    this.progressBarMode = 'determinate';
    this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
    this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);
    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let data = JSON.parse(response); //success server response
    if (data.status && data.status === 200) {
      this.formGroup.value.file = data.url;
    }
  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let error = JSON.parse(response); //error server response
    console.warn(error);
  }

  uploadFile() {
    this.uploader.uploadAll();
    this.uploader.onCompleteAll = () => {
      this.dialogRef.close(this.formGroup.value);
    };
  }

  close(data?, canceling?: boolean): void {
    if (data) data.changed = true;
    if (canceling) data = { canceling: true };
    this.dialogRef.close(data);
  }

  saveData() {
    if (this.fileInput.nativeElement.value !== '') {
      this.uploadFile();
    } else {
      this.close(this.formGroup.value);
    }
  }

  setValue(index, date) {
    if (index === 0) {
      let dateMin = new Date(date.value);
      //Le sumo 1 al dia, porque en el date de Material, el primer dia del mes es 0
      dateMin.setDate(dateMin.getDate() + 1);
      this.minDate = dateMin;
    } else if (index === 1) {
      let dateMax = new Date(date.value);
      //Le resto 1 al dia, porque en el date de Material
      dateMax.setDate(dateMax.getDate() - 1);
      this.maxDate = dateMax;
    }
  }

  createForm(data?): void {
    let title = '';
    let description = '';
    let type = '';
    let startsAt = '';
    let finishAt = '';
    let url = '';
    let file = '';


    if (data) {
      title = data.title;
      description = data.description;
      type = data.type;
      startsAt = data.startsAt;
      finishAt = data.finishAt;
      url = data.url;
      this.fileName = data.file;
      file = data.file;
    }
    this.formGroup = this.formBuilder.group({
      title: [title, [Validators.required]],
      description: [description, []],
      type: [type, [Validators.required]],
      startsAt: [startsAt, [Validators.required]],
      finishAt: [finishAt, []],
      file: [file, []]
    });

    if (data && data.type === 'feePayment') this.formGroup.addControl('url', this.formBuilder.control(data.url, Validators.required));
  }

  changeType(type): void {
    this.updateFormGroup(type.value);
  }

  updateFormGroup(type: string): void {
    (type === 'feePayment')
      ? this.formGroup.addControl('url', this.formBuilder.control('', Validators.required))
      : this.formGroup.removeControl('url');
  }

  fileChangeEvent(event) {
    this.formGroup.get('file').setValue(this.fileInput.nativeElement.value);
  }

}
