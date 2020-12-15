import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit {

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    private translate: TranslateService,
    private logsService: LogsService) {
    dialogRef.disableClose = true;
  }
  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.menu.deleteCancel'
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  closeModal(state: boolean): void {
    this.dialogRef.close(state);
  }

  cancel() {
    this.dialogRef.close();
  }
}
