import { Component, Inject, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ApiService } from 'src/app/shared/services/api.service';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';
import { UserService } from 'src/app/shared/services/user.service';
import { MultipleFilesUploaderComponent } from 'src/app/multiple-files-uploader/multiple-files-uploader.component';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';


@Component({
  selector: 'app-add-documentation-modal',
  templateUrl: 'add-documentation-modal.component.html'
})
export class AddDocumentationModalComponent {
  formInvalid = true;
  uploader: FileUploader;
  loading = false;
  formGroup: FormGroup;
  urlUpload = `${this.apiService.endpoint}/offers/uploadFile/`;
  hasBaseDropZoneOver: boolean;
  progressBarMode: ('determinate' | 'query');
  title: string;
  fileName: string;
  @ViewChild('fileInput') fileInput;
  dataUploader: any;
  visibilityBefore: string;
  idOffer: any;

  constructor(
    public dialogRef: MatDialogRef<AddDocumentationModalComponent>,
    private userService: UserService,
    private formBuilder: FormBuilder,
    public apiService: ApiService,
    public api: SelectionApiService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {
    if (data && data.titleModal) {
      this.title = data.titleModal;
    }

    if (data && data.doc) {
      this.visibilityBefore = data.doc.visibility;
      this.createForm(data.doc);
      this.title += '"' + data.doc.title + '"';
    } else {
      this.createForm();
    }

    if (data && data.idOffer) {
      this.idOffer = data.idOffer;
    }


    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: this.urlUpload + data.id + '/documentations',
        queueLimit: 1,
        method: 'PUT',
        headers: requestHeaders
      }
    );
    this.hasBaseDropZoneOver = false;
    this.progressBarMode = 'determinate';
    this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
    this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);


  }

  fileChangeEvent(event) {
    this.formGroup.get('file').setValue(this.fileInput.nativeElement.value);
  }

  openFileUploader() {
    const dialog = this.dialog.open(MultipleFilesUploaderComponent, { width: '500px', data: { singleFile: true } });
    dialog.afterClosed().subscribe(async dataUploader => {
      if (dataUploader) {
        this.uploader = dataUploader.data;
        this.formGroup.value.file = dataUploader.data.queue[0].file.name;
        this.createForm(this.formGroup.value);
      }
    });
  }

  uploadFile() {
    this.uploader.uploadAll();
    this.uploader.onCompleteAll = () => {
      this.dialogRef.close(this.formGroup.value);
    };
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let data = JSON.parse(response); // success server response
    if (data.status && data.status === 200) {
      this.formGroup.value.file = data.url;
    }
  }
  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let error = JSON.parse(response); // error server response
    console.warn(error);
  }

  close(data?): void {
    this.dialogRef.close(data);
    if (data) data.changed = true;
  }

  saveData() {
    if (this.formGroup.value.file !== '') {
      if (this.uploader.queue.length) {
        this.formGroup.value.fileUploader = this.uploader;
        this.close(this.formGroup.value);
      } else {
        if (this.formGroup.value.visibility !== this.visibilityBefore) {
          this.apiService.changeFileVisibility(this.idOffer, this.formGroup.value.file, this.formGroup.value.visibility )
          .subscribe();
        }
        this.close(this.formGroup.value);
      }
    } else {
      this.close(this.formGroup.value);
    }
  }

  createForm(data?): void {
    let title = '';
    let visibility = '';
    let file = '';
    if (data) {
      title = data.title;
      visibility = data.visibility;
      this.fileName = data.file;
      file = data.file;
      this.formInvalid = false;

    }
    this.formGroup = this.formBuilder.group({
      title: [title, [Validators.required]],
      visibility: [visibility, [Validators.required]],
      file: [file, [Validators.required]]
    });


  }

}
