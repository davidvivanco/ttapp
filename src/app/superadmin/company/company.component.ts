import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UnsubscribeCompanyModalComponent } from './unsubscribe-company-modal/unsubscribe-company-modal.component';
import { CompanyModalComponent } from './company-modal/company-modal.component';
import { ConfigurationService } from '../../shared/services/configuration.service';

import { UserService } from '../../shared/services/user.service';
import { Permissions } from '../../shared/models/permissions.model';
import { FormControl } from '@angular/forms';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { LogsMessagesCommon } from '../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit, ComponentCanDeactivate {
  permissions: Permissions;
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  availableGroups = [];
  existingCompetencies: any;

  formGroup: FormGroup;
  company: any;
  modules: any;

  isModified: boolean;
  complete: boolean;

  mobileQuery: boolean;
  placeholder: any = {};
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesCommon;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private logsService: LogsService,
    public configurationService: ConfigurationService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver.observe([
      '(max-width: 768px)'
    ]).subscribe(result => {
      if (result.matches) this.mobileQuery = true;
      else this.mobileQuery = false;
    });
  }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.common.errorOccurred',
      'logsMessages.common.configurationSaved',
      'company.legalInformation.cif',
      'company.legalInformation.socialName',
      'company.basicInformation.companyName',
      'company.basicInformation.companyUrl',
      'company.basicInformation.companyPhone'
    ];
    this.getTranslations();
    this.company = this.configurationService.getConfiguration();
    this.createFormGroup(this.company);
    this.permissions = this.userService.getPermissions();
    this.modules = this.company.company.companyInfo.modules.default;
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
    this.isModified = false;
    // console.log(this.company)
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.translations = translations;
        this.setPlaceholderText(this.mobileQuery);
      });
  }

  setPlaceholderText(isMobile) {
    if (isMobile) {
      Object.keys(this.placeholder).forEach((key) => this.placeholder[key] = '');
    } else {
      this.placeholder.social = this.translations['company.legalInformation.socialName'];
      this.placeholder.cif = this.translations['company.legalInformation.cif'];
      this.placeholder.companyName = this.translations['company.basicInformation.companyName'];
      this.placeholder.companyUrl = this.translations['company.basicInformation.companyUrl'];
      this.placeholder.companyPhone = this.translations['company.basicInformation.companyPhone'];
    }
  }
  createFormGroup(data): void {
    this.formGroup = this.formBuilder.group({
      company: this.formBuilder.group({
        publicName: [{ value: data.company.publicName, disabled: true }, Validators.required],
        companyInfo: this.formBuilder.group({
          mainInfo: this.formBuilder.group({
            url: [{ value: data.company.companyInfo.mainInfo.url, disabled: true }, Validators.required],
            phone: [data.company.companyInfo.mainInfo.phone, [Validators.required]]
          }),
          legalInfo: this.formBuilder.group({
            businessName: [data.company.companyInfo.legalInfo.businessName, [Validators.required]],
            cif: [data.company.companyInfo.legalInfo.cif, [Validators.required]]
          }),
          addressInfo: this.formBuilder.group({
            optional: [data.company.companyInfo.addressInfo.optional],
            main: this.formBuilder.group({
              street: [data.company.companyInfo.addressInfo.main.street, [Validators.required]],
              city: [data.company.companyInfo.addressInfo.main.city, [Validators.required]],
              zipcode: [data.company.companyInfo.addressInfo.main.zipcode, [Validators.required]],
              province: [data.company.companyInfo.addressInfo.main.province, [Validators.required]],
              country: [data.company.companyInfo.addressInfo.main.country, [Validators.required]]
            })
          }),
        }),
      }),
    });
  }

  onChanges(): void {
      this.isModified = true;
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
  }

  handleSuccess() {
    this.logsService.log(this.translations['logsMessages.common.configurationSaved']);
  }

  openCompanyModal() {
    this.dialog.open(CompanyModalComponent, { data: { modules: this.company.company.companyInfo.modules, suscription: this.company.company.companyInfo.subscriptions } });
  }

  openUnsubscribeCompanyModal() {
    this.dialog.open(UnsubscribeCompanyModalComponent, {});
  }

  saveConf() {
    const data = this.formGroup.getRawValue();
    this.apiService.saveConfiguration(data).subscribe(res => {
      if (res) {
        this.configurationService.load().then(e => {
          this.company = this.configurationService.getConfiguration();
        });
      }
      this.handleSuccess();
      this.isModified = false;
    }, this.handleError.bind(this)
    );
  }

  canDeactivate() {
    return !this.isModified;
  }
}
