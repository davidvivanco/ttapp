import { Component, OnInit, ViewChild, Inject, EventEmitter, Output, OnDestroy } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';

import { ApiService } from '../shared/services/api.service';
import { ConfigurationService } from '../shared/services/configuration.service';
import { FormBuilder, FormGroup } from '@angular/forms';

import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

import { Router} from '@angular/router';

import { DOCUMENT } from '@angular/platform-browser';
import { UserService } from '../shared/services/user.service';
import { EventService } from '../shared/services/event.service';

@Component({
  selector: 'app-modal-embed',
  templateUrl: './modal-embed.component.html',
  styleUrls: ['./modal-embed.component.scss']
})
export class ModalEmbedComponent implements OnInit, OnDestroy {
  schemaPersonalData;
  fields;
  nameOrg;
  formGroup: FormGroup;
  user;

  @Output() sendModalEmbedData: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  modalActive;
  newFields = [];

  newChanges = false;
  blockId: string;
  isChecked: boolean;
  isSchemaCreated = false;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;

  yes: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog,
    public api: ApiService,
    private translate: TranslateService,
    public configurationService: ConfigurationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    @Inject(DOCUMENT) private _document,
    private eventService: EventService
  ) {
    this.user = this.userService.getUser();
  }

  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.yes',
      'genericMessages.no'
    ];
    this.getLogsTranslations();
    this.nameOrg = this.configurationService.getConfiguration().company.publicName;
    const subscription = this.eventService.showModalEmbed.subscribe((notificationData) => {
      this.active = notificationData.active;
      this.modalActive = notificationData.modalActive;
      this.sendModalEmbedData.emit(this.active);
    });

    this.eventService.setSubscription(subscription);
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }


}
