import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ApiService } from '../../../shared/services/api.service';
import { Router } from '@angular/router';

import { ConfigurationService } from '../../../shared/services/configuration.service';

import { EventService } from '../../../shared/services/event.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { CustomHome, HomeObject, ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { TranslateService } from '@ngx-translate/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';

@Component({
  selector: 'app-edit-home',
  templateUrl: './edit-home.component.html',
  styleUrls: ['./edit-home.component.scss']
})
export class EditHomeComponent implements OnInit, ComponentCanDeactivate {
  loading = false;
  previewEnabled: boolean;
  publishEnabled: boolean;
  ismodified = false;

  editHomeForm: FormGroup;
  customHome: CustomHome;
  draft: HomeObject;
  conf: ConfigurationCompany;
  defaultHome: boolean;
  imageRoute: string;

  toast: any;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '50px',
    maxHeight: '450px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    toolbarPosition: 'top',
    defaultParagraphSeparator: '',
    defaultFontName: 'Arial',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    sanitize: false,
    uploadUrl: `${this.apiService.endpoint}/configuration/photo/customHome/draft`
  };

  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  // private translations: LogsMessagesCommon;


  constructor(
    public dialog: MatDialog,
    private apiService: ApiService,
    public configurationService: ConfigurationService,
    private eventService: EventService,
    private router: Router,
    private translate: TranslateService,
    private logsService: LogsService,
    private formBuilder: FormBuilder,
  ) {

  }

  ngOnInit() {
    this.conf = this.configurationService.getConfiguration();
    if (!Object.keys(this.conf.company).includes('customHome') || !Object.keys(this.conf.company.customHome).includes('draft')) {
      const conf = {
        company: {
          customHome: {
            default: true,
            draft: {
              title: '',
              imgUrl: '',
              intro: '',
              description: '',
              buttonUrl: ''
            }
          }
        }
      };
      this.apiService.saveConfiguration(conf).subscribe(res => {
        if (res) {
          this.configurationService.load().then(e => {
            this.conf = this.configurationService.getConfiguration();
            this.createFormGroup(this.conf);
          });
        }
      }
      );
    } else {
      this.createFormGroup(this.conf);
    }

    this.defaultHome = (Object.keys(this.conf.company).includes('customHome') ||
      Object.keys(this.conf.company.customHome).includes('default')) ? this.conf.company.customHome.default : false;

    this.translate.get('customHome.toast').subscribe((text: string) => {
      if (text) this.toast = text;
    });

    (this.conf && this.conf.company && this.conf.company.customHome && this.conf.company.customHome.draft && this.conf.company.customHome.draft.imgUrl) ?
      this.imageRoute = this.conf.company.customHome.draft.imgUrl : this.imageRoute = '';

    this.conf.company.customHome.published ?
      (JSON.stringify(this.conf.company.customHome.custom) !== JSON.stringify(this.conf.company.customHome.draft) ?
        this.publishEnabled = true : this.publishEnabled = false) :
      ((this.conf.company.customHome.draft.title !== '' && this.conf.company.customHome.draft.description !== '')
        && JSON.stringify(this.conf.company.customHome.custom) !== JSON.stringify(this.conf.company.customHome.draft) ?
        this.publishEnabled = true : this.publishEnabled = false);

    (this.conf.company.customHome.draft.title !== '' && this.conf.company.customHome.draft.description !== '') ?
      this.previewEnabled = true : this.previewEnabled = false;
  }

  createFormGroup(data): void {
    let customHome: CustomHome;
    customHome = data.company.customHome;
    this.editHomeForm = this.formBuilder.group({
      title: [customHome.draft.title, Validators.required],
      description: [customHome.draft.description, Validators.required],
      buttonUrl: [customHome.draft.buttonUrl],
    });
  }

  preview() {
    this.router.navigate(['/admin/edit-home-preview']);
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.toast.error);
  }

  handleSuccess(string) {
    switch (string) {
      case 'save': {
        this.logsService.log(this.toast.save);
        break;
      }
      case 'publish': {
        this.logsService.log(this.toast.publish);
        break;
      }
      case 'image': {
        this.logsService.log(this.toast.image);
        break;
      }
      default: {
        this.defaultHome ? this.logsService.log(this.toast.defaultOn) : this.logsService.log(this.toast.defaultOff);
        break;
      }
    }
  }

  saveHome() {
    this.draft = this.editHomeForm.getRawValue();
    this.draft.imgUrl = this.imageRoute;

    const customHome: CustomHome = {
      default: this.defaultHome,
      published: false,
      draft: this.draft
    };
    const configuration = {
      company: {
        customHome
      }
    };
    this.apiService.saveConfiguration(configuration).subscribe(res => {
      if (res) {
        this.configurationService.load().then(e => {
          this.conf = this.configurationService.getConfiguration();
          this.previewEnabled = true;
          (!this.conf.company.customHome.published &&
            JSON.stringify(this.conf.company.customHome.custom) !== JSON.stringify(this.conf.company.customHome.draft)) ? this.publishEnabled = true : this.publishEnabled = false;
        });
      }
      this.handleSuccess('save');
    }, this.handleError.bind(this)
    );
    this.publishEnabled = true;
    this.ismodified = false;
  }

  publish(event: Event) {
    event.preventDefault();
    let custom: HomeObject;
    if (this.draft) {
      this.draft.imgUrl = this.imageRoute;
      custom = this.draft;
    } else {
      this.conf.company.customHome.draft.imgUrl = this.imageRoute;
      custom = this.conf.company.customHome.draft;
    }

    const configuration = {
      company: {
        customHome: {
          published: true,
          custom
        }
      }
    };

    this.apiService.saveConfiguration(configuration).subscribe(res => {
      if (res) {
        this.configurationService.load().then(e => {
          this.conf = this.configurationService.getConfiguration();
        });
      }
      this.handleSuccess('publish');
      this.publishEnabled = false;
    }, this.handleError.bind(this)
    );
  }

  activeDefault() {
    this.defaultHome = !this.defaultHome;

    const configuration = {
      company: {
        customHome: {
          default: this.defaultHome
        }
      }
    };

    this.apiService.saveConfiguration(configuration).subscribe(res => {
      if (res) {
        this.configurationService.load().then(e => {
          this.conf = this.configurationService.getConfiguration();
        });
      }
      this.handleSuccess('default');
    }, this.handleError.bind(this)
    );
  }

  changeState() {
    // const initStatePublished = this.publishEnabled; No se usa variable ?¿ sonarQube
    if (this.editHomeForm.value.title !== this.conf.company.customHome.draft.title ||
      this.editHomeForm.value.description !== this.conf.company.customHome.draft.description ||
      this.editHomeForm.value.buttonUrl !== this.conf.company.customHome.draft.buttonUrl) {

      this.previewEnabled = false;
      this.publishEnabled = false;
      this.ismodified = true;
    } else {
      this.previewEnabled = true;
      this.publishEnabled = true;
      this.ismodified = false;
    }
  }

  canDeactivate() {
    return !this.ismodified;
  }

}
