import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-upload-avatar-modal',
  templateUrl: './upload-avatar-modal.component.html'
})
export class UploadAvatarModalComponent {

  imageChangedEvent: string;
  croppedImage: string = null;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<UploadAvatarModalComponent>,
  ) {
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
