import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ApiService } from 'src/app/shared/services/api.service';
import { UserInfoComponent } from '../user-info.component';
import { EventService } from '../../../../shared/services/event.service';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { ChangesConfirmationModalComponent } from 'src/app/shared/components/shared/modals/changes-confirmation-modal/changes-confirmation-modal.component';
import { LogsService } from '../../../../shared/services/shared-services/logs.service';
import { LogsMessagesCommon } from '../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-info-modal',
  templateUrl: 'user-info-modal.component.html',
})
export class UserInfoModalComponent implements OnInit {
  employee$: any;
  configuration: any;
  @ViewChild(UserInfoComponent)
  private userInfoComponent: UserInfoComponent;
  formIsDirty = false;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesCommon;

  constructor(public apiService: ApiService,
    private eventService: EventService,
    private configurationService: ConfigurationService,
    public dialogRef: MatDialogRef<UserInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private logsService: LogsService,
    private translate: TranslateService
  ) {

    this.translationsKeys = ['logsMessages.common.errorOccurred']
    this.getTranslations();
    this.employee$ = data.employee;
    this.configuration = this.configurationService.getConfiguration();
    dialogRef.disableClose = true;
  }
  ngOnInit(): void { }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations
      })
  }
  close(): void {
    if (this.formIsDirty) {
      // Launch confirmation modal si hay cambios
      const dialog = this.dialog.open(ChangesConfirmationModalComponent, {});
      dialog.afterClosed().subscribe(res => {
        if (res) this.dialogRef.close();
      });
    } else this.dialogRef.close();
  }

  editUserInfo(event) {
    if (event === 'success') this.dialogRef.close('success');
    else this.dialogRef.close(this.translations["logsMessages.common.errorOccurred"]);
  }

  setFormStatus(event) {
    if (event === 'close') this.dialogRef.close();
    else this.formIsDirty = event;
    // console.log('Modal padre isDirty status', this.formIsDirty);
  }
}
