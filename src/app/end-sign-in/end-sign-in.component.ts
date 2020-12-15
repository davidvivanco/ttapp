import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';

import { ApiService } from './../shared/services/api.service';
import { ConfigurationService } from './../shared/services/configuration.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';

import { DOCUMENT } from '@angular/platform-browser';
import { UserService } from '../shared/services/user.service';
import { EventService } from '../shared/services/event.service';
import { LogsService } from '../shared/services/shared-services/logs.service';

@Component({
  selector: 'app-end-sign-in',
  templateUrl: './end-sign-in.component.html',
  styleUrls: ['./end-sign-in.component.scss']
})
export class EndSignInComponent implements OnInit {
  schemaPersonalData;
  fields;
  nameOrg;
  formGroup: FormGroup;
  user;

  newFields = [];
  filledFields = [];
  loading = false;

  newChanges = false;
  blockId: string;
  isChecked: boolean;
  isSchemaCreated = false;
  private logsMessagesKeys: Array<string>;
  logsMessagesTranslations: LogsMessagesCommon;

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
    private eventService: EventService,
    private logsService: LogsService,
    @Inject(DOCUMENT) private _document) {
    this.getSchema();
    this.user = this.userService.getUser();
  }
  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.yes',
      'genericMessages.no',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.returnError'
    ];
    this.getLogsTranslations();
    // this.yes = this.logsMessagesTranslations['genericMessages.yes'];
    this.nameOrg = this.configurationService.getConfiguration().company.publicName;
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  getSchema() {
    this.api.getSchemaPersonalData().subscribe((res: any) => {
      if (res !== null) {
        // if res there is schema
        this.schemaPersonalData = res;
        this.fields = this.schemaPersonalData.versions[this.schemaPersonalData.versions.length - 1].blocks[0].fields;
        if (this.user.personalData.extraData && this.user.personalData.extraData.block) {
          let fieldsUser = this.user.personalData.extraData.block.fields;
          let fieldsKeysUser = [];
          fieldsUser.forEach(element => {
            fieldsKeysUser.push(element.label);
          });
          this.newFields = [];
          this.fields.forEach(element => {
            if (fieldsKeysUser.indexOf(element.label) === -1) { // si es nuevo añadir
              this.newFields.push(element);
            } else if (fieldsKeysUser.indexOf(element.label) !== -1 && !fieldsUser[fieldsKeysUser.indexOf(element.label)].value) {
              this.newFields.push(element); // si no es nuevo pero está vacío añadir
            } else this.filledFields.push(fieldsUser[fieldsKeysUser.indexOf(element.label)]); // si no es nuevo y está completo guardar para añadir luego
          });
        } else {
          this.newFields = this.fields;
        }

        this.createForm(this.newFields);
        this.blockId = res.blocks[0]._id;
      }
    });
  }

  createForm(data) {
    this.formGroup = new FormGroup({});
    data.forEach((element, i) => {
      this.formGroup.addControl(element.label, new FormControl('', [Validators.required]));
    });
  }

  submit() {

    // show loader
    this.loading = true;

    if (this.formGroup.invalid) {
      this.fields.forEach((element, i) => {
        this.formGroup.get(element.label).markAsTouched();
      });
      return;
    }

    const values = this.formGroup.getRawValue();
    let jsontoSend = {};
    jsontoSend['blockId'] = this.blockId;
    jsontoSend['order'] = 0;
    jsontoSend['name'] = 'Datos personales Extra';

    this.newFields.forEach(element => {
      element.value = values[element.label];
      element['fieldId'] = element._id;
      delete element._id;
    });

    jsontoSend['fields'] = [];
    if (this.filledFields.length) {
      this.filledFields.forEach(field => jsontoSend['fields'].push(field));
    }
    jsontoSend['fields'].push(...this.newFields);

    this.api.addExtraPersonalData({ 'block': jsontoSend }).subscribe(res => {
      if (res.extraData && res.extraData.block) {
        let json = {};
        json['active'] = false;
        json['modalActive'] = 'dataExtraDisabled';
        this.eventService.sendNotificationModalEmbed(json);
        this.user.personalData.extraData = res.extraData;
        this.userService.setUser(this.user);
        let queryParams = [];
        queryParams['controlExtraData'] = true;
        this.router.navigate(['/home'], { queryParams });
        this.handleSuccess();
      } else {
        this.handleError();
      }
    });
  }

  handleSuccess() {
    this.loading = false;
    this.logsService.log(this.logsMessagesTranslations['logsMessages.common.actionSuccess']);
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.returnError']);
  }

}
