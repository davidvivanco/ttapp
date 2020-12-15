import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ApiService } from '../../../shared/services/api.service';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';

@Component({
  selector: 'app-upload-template-modal',
  templateUrl: './upload-template-modal.component.html',
  styleUrls: ['./upload-template-modal.component.scss']
})
export class UploadTemplateModalComponent implements OnInit {
  public uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  progressBarMode: ('determinate' | 'query');

  constructor(public dialogRef: MatDialogRef<UploadTemplateModalComponent>, private apiService: ApiService, private userService: UserService) {
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: `${this.apiService.endpoint}/employees/uploadExcelTemplate`,
        queueLimit: 1,
        headers: requestHeaders,
        allowedMimeType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      }
    );
    this.hasBaseDropZoneOver = false;
    this.progressBarMode = 'determinate';
  }

  ngOnInit() { }

  uploadFile() {
    this.uploader.uploadAll();
    this.uploader.onProgressAll = () => {
      this.dialogRef.close('success');
    };
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  close(status?): void {
    this.dialogRef.close(status);
  }

}
