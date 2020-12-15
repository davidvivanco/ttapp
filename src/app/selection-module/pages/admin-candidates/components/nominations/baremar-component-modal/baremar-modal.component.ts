import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ApiService } from 'src/app/shared/services/api.service';
import { Block } from '../../../../../../curriculum/classes/block';
import { LogsMessagesCommon } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { MY_FORMATS } from 'src/app/globals';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { Candidature } from '../../../../../interfaces/candidature';

@Component({
  selector: 'app-baremar-component-modal',
  templateUrl: 'baremar-modal.component.html',
  styleUrls: ['./baremar-modal.component.scss'],
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
export class BaremarModalComponent implements OnInit {

  blocks: any
  loading = false;
  block: Block;
  translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  translations: LogsMessagesCommon;
  requirementResults: any;

  candidature: Candidature;
  result;

  constructor(
    public apiService: ApiService,
    private api: SelectionApiService,
    public dialogRef: MatDialogRef<BaremarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private translate: TranslateService,
    private logsService: LogsService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.translationsKeys = [
      'logsMessages.common.saveSuccess',
      'logsMessages.common.errorOccurred',
    ];

    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);

  }

  ngOnInit() {
    this.getTranslations();
    this.candidature = this.data.candidature;
    this.result = 0;
    this.requirementResults = this.data.candidature.requirementResults;
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations
      })
  }

  close(): void {
    this.dialogRef.close();
  }

  handleError() {
    this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
  }
}
