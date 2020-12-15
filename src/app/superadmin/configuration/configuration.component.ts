import { Component, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort, DateAdapter } from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';

import { ConfigurationService } from '../../shared/services/configuration.service';

import { UserService } from '../../shared/services/user.service';
import { Permissions } from '../../shared/models/permissions.model';
import { FormControl } from '@angular/forms';
import { TranslationService } from '../../shared/services/translation.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UploadImageCompanyModalComponent } from './upload-image-company-modal/upload-image-company-modal.component';
import { EventService } from '../../shared/services/event.service';
import { LogsMessagesCommon } from '../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { FileUploader } from 'ng2-file-upload';
import { AuthInterceptor } from 'src/app/shared/services/authInterceptor';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit, AfterViewChecked, ComponentCanDeactivate {
  permissions: Permissions;
  loading = false;
  dataSource = new MatTableDataSource<any>([]);

  mainColorValue: string;
  secondaryColorValue: string;

  conf: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  selectedLanguage: string;
  availableLangs = [];
  enabledLangs: any[];

  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesCommon;

  uploader: FileUploader;

  isModified = false;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private logsService: LogsService,
    private translationService: TranslationService,
    private translate: TranslateService,
    public configurationService: ConfigurationService,
    private eventService: EventService,
    private cdRef: ChangeDetectorRef,
    private dateAdapter: DateAdapter<Date>
  ) {
  }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.configurationSaved',
    ];
    this.getTranslations();
    this.permissions = this.userService.getPermissions();
    this.conf = this.configurationService.getConfiguration();
    this.selectedLanguage = this.translationService.getCurrentLang(); // Obtenemos el idioma cargado en la plataforma
    this.availableLangs = this.sortLangs(this.conf.services.translations.languages); // Obtenemos los idiomas disponibles
    this.enabledLangs = this.setEnabledLangs(this.conf.services.translations.languages); // Obtenemos los idiomas habilitados

    this.checkDefault();

    this.mainColorValue = this.conf.company.primaryColor;
    this.secondaryColorValue = this.conf.company.secondaryColor;
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations;
      });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges(); // To solve -> Error: ExpressionChangedAfterItHasBeenCheckedError -> para el color picker
  }

  sortLangs(langs) {
    const tempArr = Object.keys(langs).sort().reverse();
    return tempArr;
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
  }

  handleSuccess() {
    this.logsService.log(this.translations['logsMessages.common.configurationSaved']);
  }

  uploadPhoto(folder) {
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: `${this.apiService.endpoint}/uploaderFiles/uploadMultipleFiles?path=${folder}&privateFile=false`,
        queueLimit: 1,
        method: 'PUT',
        headers: requestHeaders
      }
    );

    const dialogRef = this.dialog.open(UploadImageCompanyModalComponent, { data: folder, autoFocus: false });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const files = [result.file];
        this.uploader.addToQueue(files);
        this.uploader.uploadAll();
        this.uploader.onCompleteAll = () => {
          this.configurationService.load().then(e => {
            this.conf = this.configurationService.getConfiguration();
            this.eventService.changeLogosEmitter.emit(true);
          });
        };
      }
    });
  }

  valuePersonalData(key: string) {
    this.conf.company.appConfig[key] = !this.conf.company.appConfig[key];
    this.isModified = true;
  }

  valueCurriculum(key: string) {
    this.conf.company.appConfig[key] = !this.conf.company.appConfig[key];
    this.isModified = true;
  }

  // BOTS
  botStatus(i, event) {
    this.conf.company.bots[i].active = event.checked;
    this.saveConf();
  }

  linkedinStatus(event) {
    this.conf.services.linkedinAccess = !this.conf.services.linkedinAccess;
    this.saveConf();
  }

  facebookStatus(event) {
    this.conf.services.facebookAccess = !this.conf.services.facebookAccess;
    this.saveConf();
  }

  googleStatus(event) {
    this.conf.services.googleAccess = !this.conf.services.googleAccess;
    this.saveConf();
  }

  changeShowUsersDropDate() {
    this.conf.company.showUsersDropDate = !this.conf.company.showUsersDropDate;
    this.saveConf();
  }

  changeTheme(key: string, value: string) {
    document.documentElement.style.setProperty(key, value);
  }

  // LANGUAGES
  setEnabledLangs(obj) {
    const arr = [];
    for (const [key, value] of Object.entries(obj)) { if (value) arr.push(key); }
    return arr;
  }

  enableLang(item: any) {
    this.conf.services.translations.languages[item] = !this.conf.services.translations.languages[item];
    this.enabledLangs = this.setEnabledLangs(this.conf.services.translations.languages);
    this.checkDefault();
    this.isModified = true;
  }

  checkDefault() {
    if (!(this.enabledLangs.some(lang => lang === this.conf.services.translations.defaultLanguage))) {
      this.conf.services.translations.defaultLanguage = this.enabledLangs[0];
    }
  }

  saveConf() {
    this.conf.company.primaryColor = this.mainColorValue;
    this.conf.company.secondaryColor = this.secondaryColorValue;
    const cloneConf = JSON.parse(JSON.stringify(this.conf));
    delete cloneConf.company.companyInfo.subscriptions; // ToDo -> Quitar clonado y borrado cuando fix de back para evitar esto!
    this.apiService.saveConfiguration(cloneConf).subscribe(res => {
      this.changeTheme('--primary-color', this.mainColorValue);
      this.changeTheme('--secondary-color', this.secondaryColorValue);
      this.handleSuccess();
      this.isModified = false;
    }, this.handleError.bind(this)
    );
  }

  changeColor() {
    this.isModified = true;
  }

  canDeactivate() {
    return !this.isModified;
  }
}
