import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MultipleFilesUploaderComponent } from 'src/app/multiple-files-uploader/multiple-files-uploader.component';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';

@Component({
  selector: 'app-loadfiles',
  templateUrl: './loadfiles.component.html'
})
export class LoadfilesComponent implements OnInit {

  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  constructor(
    public dialog: MatDialog,
    private logsService: LogsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.common.uploading',
      'logsMessages.common.uploadCancel'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  uploadFiles(singleFile: boolean) {
    const dialog = this.dialog.open(MultipleFilesUploaderComponent, { width: '500px', data: { singleFile: singleFile} });

    dialog.afterClosed().subscribe(data => {
      if (data.status === 'success') this.logsService.log(this.translations['logsMessages.common.uploading']);
      if (data.status === 'cancelled') this.logsService.logError('logsMessages.common.uploadCancel');
    });
  }
}
