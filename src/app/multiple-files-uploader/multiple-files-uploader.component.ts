import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
import { ApiService } from '../shared/services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UploadTemplateModalComponent } from '../admin/users/upload-template-modal/upload-template-modal.component';
import { UserService } from '../shared/services/user.service';
import { AuthInterceptor } from '../shared/services/authInterceptor';

@Component({
  selector: 'app-multiple-files-uploader',
  templateUrl: './multiple-files-uploader.component.html',
  styleUrls: ['./multiple-files-uploader.component.scss']
})
export class MultipleFilesUploaderComponent {

  fileChangedEvent: string;
  file: string = null;
  @ViewChild('fileInputSingle') fileInputSingle: ElementRef;

  uploadForm: FormGroup;
  public uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  progressBarMode: ('determinate' | 'query');
  singleFile: boolean;
  urlFiles: string[];

  constructor(
    public dialogRef: MatDialogRef<UploadTemplateModalComponent>,
    private apiService: ApiService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: `${this.apiService.endpoint}/uploaderFiles/uploadMultipleFiles`,
        headers: requestHeaders,
        isHTML5: true,
        additionalParameter: {}
      });
    this.hasBaseDropZoneOver = false;
    this.progressBarMode = 'determinate';
    this.singleFile = data.singleFile;
    this.urlFiles = [];
  }

  uploadSubmit(uploader): any {
    this.uploader = uploader;
    this.uploader.queue.forEach(file => {
      file.url = file.url + `?path=customPath&privateFile=false`;
    });
    this.uploader.uploadAll();

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      let jsonResponse = JSON.parse(response);
      this.urlFiles.push(jsonResponse.uploadedFile.fullPath);
    };

    this.uploader.onCompleteAll = () => {
      this.dialogRef.close({ status: status, data: this.urlFiles });
    };
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  close(status?, data?): void {
    if(status || data) this.dialogRef.close({ status: status, data: data })
    else  this.dialogRef.close();
  }

  deleteFiles() {
    if (this.uploader.queue.length > 1) this.uploader.queue.splice(1, this.uploader.queue.length);
  }
}
