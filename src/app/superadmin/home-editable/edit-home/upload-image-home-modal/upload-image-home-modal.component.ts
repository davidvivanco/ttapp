import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslationService } from 'src/app/shared/services/translation.service';

@Component({
  selector: 'app-upload-image-home-modal',
  templateUrl: './upload-image-home-modal.component.html'
})
export class UploadImageHomeModalComponent {

  imageChangedEvent: string;
  croppedImage: string = null;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<UploadImageHomeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translationService: TranslationService) {
      this.translationService.loadTranslations('shared', 'uploadAvatarModal');
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
