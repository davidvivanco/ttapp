import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-upload-image-company-modal',
  templateUrl: './upload-image-company-modal.component.html'
})
export class UploadImageCompanyModalComponent {

  imageChangedEvent: string;
  croppedImage: string = null;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<UploadImageCompanyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // console.log('folder', data);
  }

  exportPDF(extended) {
    this.dialogRef.close(extended);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close(this.croppedImage);
  }

  fileChangeEvent(event: any): void {
    if (this.fileInput.nativeElement.value) this.imageChangedEvent = event;
    else this.croppedImage = this.imageChangedEvent = '';
  }

  imageCropped(image: string) {
    this.croppedImage = image;
  }

}
