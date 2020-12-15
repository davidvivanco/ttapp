import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/shared/services/api.service';
// import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

@Component({
  selector: 'app-view-modal',
  templateUrl: './view-modal.component.html',
  styleUrls: ['./view-modal.component.scss']
})
export class ViewModalComponent implements OnInit {
  webUrlSafe: SafeResourceUrl;
  translations: any;
  iframeWidth = 1120;
  iframeHeight = 630;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ViewModalComponent>,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (window.innerWidth < 1366) {
      this.iframeWidth = 560;
      this.iframeHeight = 315;
    }
    if (window.innerWidth < 768) {
      this.iframeWidth = 280;
      this.iframeHeight = 158;
    }
    if (window.innerWidth < 360) {
      this.iframeWidth = 140;
      this.iframeHeight = 79;
    }

    this.getTranslations();
    this.webUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.element.fullPath);
  }

  onResize(event) {
    if (window.innerWidth <= 1366) {
      this.iframeWidth = 560;
      this.iframeHeight = 315;
    }
    if (window.innerWidth <= 768) {
      this.iframeWidth = 280;
      this.iframeHeight = 158;
    }
    if (window.innerWidth <= 360) {
      this.iframeWidth = 140;
      this.iframeHeight = 79;
    }
    if (window.innerWidth > 1366) {
      this.iframeWidth = 1120;
      this.iframeHeight = 630;
    }
  }

    getTranslations(): void {
      this.translate.get('genericMessages').subscribe((text: string) => {
        if (text) this.translations = text;
      });
    }

    close(element ?): void {
      this.dialogRef.close(element);
    }

    delete () {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
        data: {
          title: this.translations.delete,
          message: this.translations.deleteConfirmation
        }
      });

      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.close(this.data.element);
        }
      });
    }

    download() {
      window.location.href = this.data.element.fullPath;
    }
  }
