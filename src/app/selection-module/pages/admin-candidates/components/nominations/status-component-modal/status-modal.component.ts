import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ApiService } from 'src/app/shared/services/api.service';

import { FormGroup } from '@angular/forms';
import { Block } from '../../../../../../curriculum/classes/block';

import { UserService } from 'src/app/shared/services/user.service';
import { LogsMessagesCommon } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

import { MY_FORMATS } from 'src/app/globals';

@Component({
  selector: 'app-status-component-modal',
  templateUrl: 'status-modal.component.html',
  styleUrls: ['./status-modal.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StatusModalComponent {

  blocks: Block[] = [];
  loading = false;
  block: Block;
  form: FormGroup = new FormGroup({});
  blockSelected: Block;
  aux: {};
  dataFilled;
  employeeId;
  editing = false;
  translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  translations: LogsMessagesCommon;

  candidature;
  result;

  constructor(
    public apiService: ApiService,
    private userService: UserService,
    public dialogRef: MatDialogRef<StatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private translate: TranslateService,
    private logsService: LogsService,
    private dateAdapter: DateAdapter<Date>
  ) {
    // console.log('Modal data', data);
    this.translationsKeys = [
      'logsMessages.common.saveSuccess',
      'logsMessages.common.errorOccurred',
    ];
    this.getTranslations();
    this.candidature = data.candidature;
    this.result = 0;
    this.candidature.qualificationResults.forEach(element => {
      let resultAux = element.totalScore >= element.maxValue ? element.maxValue : element.totalScore;
      this.result += resultAux;
    });

    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }
  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations;
      });
  }


  close(): void {
    this.dialogRef.close();
  }


  handleError() {
    this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
  }
}
