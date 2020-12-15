import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as icons from '../../../../assets/maticons.json';
import { MatDialogRef, MAT_DIALOG_DATA, MatSlideToggleChange, MatOption } from '@angular/material';
import { MenuService } from './../../../shared/services/menu.service';
import { MenuUrl } from './../../../shared/models/menu-url.model';
import { ApiService } from './../../../shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';

@Component({
  selector: 'app-url-modal',
  templateUrl: './url-modal.component.html',
  styleUrls: ['./url-modal.component.scss']
})
export class UrlModalComponent implements OnInit {

  formGroup: FormGroup;
  iconList: any = (icons as any).default;
  selectedIconList;
  selectedIconItem;
  selectedUrl;
  allPermissionsSelected = false;
  extractedPermissions = [];
  @ViewChild('todos') private todos: MatOption;
  @ViewChild('ninguno') private ninguno: MatOption;
  urlModel: MenuUrl;
  titlesList = []; // títulos de enlaces y carpetas
  // modal buttons flags
  addEnabledTitle = false;
  addEnabledType = false;
  addEnabledUrl = false;
  addEnabledUrl2 = false;
  addEnabledPermissions = false;
  // logic flags
  fromEditUrl = false;
  fromCreateUrl = false;
  isChecked = false;
  iframeChecked = false;
  type = null;
  pages;
  permissions;
  services;
  loading = true;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UrlModalComponent>,
    private menuService: MenuService,
    private apiService: ApiService,
    private translate: TranslateService,
    private logsService: LogsService
  ) { }

  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.menu.titleError'
    ];
    this.iconsNames(this.iconList);
    this.selectedIconList = this.iconList;
    this.getLogsTranslations();
    this.getAllPermissions().then(result => {//chain data load to avoid errors
      if (result) this.syncLoad();
    });
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  syncLoad() {
    this.menuService.getPages().subscribe(res => {
      this.pages = res;
      this.pages.sort(this.comparePages);
      this.urlModel = JSON.parse(JSON.stringify(this.data.block));
      if (this.data.fromCreateUrl) {
        this.createForm();
        this.fromCreateUrl = true;
      } else if (this.data.fromEditUrl) {
        this.type = this.data.block.linkType;
        this.fromEditUrl = this.data.fromEditUrl;
        this.selectedIconItem = this.data.block.icon;
        this.selectedUrl = this.pages.find(item => item.id === this.data.urlId);
        this.titlesList = this.data.titles;
        this.createForm(this.urlModel);
        if (this.data.block.linkType === true) {
          this.formGroup.patchValue({
            innerLink: this.data.block.urlId
          });
          this.addEnabledUrl2 = true;
        } else {
          this.iframeChecked = this.data.block.iframe;
          this.addEnabledUrl = true;
          if (typeof this.urlModel.permissions[0] === 'object') { // evitar que no seleccione permisos al editar varias veces seguido los enlaces
            this.formGroup.controls.permissions.patchValue(this.extractPermissionsFromArr(this.urlModel.permissions));
          }
        }
      }
      this.loading = false;
    });
  }

  getAllPermissions() {
    return new Promise((resolve, reject) => {
      this.apiService.getAllPermissions().subscribe(res => {
        if (!res) reject('error');
        if (res) resolve(this.permissions = res);
      });
    });
  }

  extractPermissionsFromArr(arr) {
    let aux = [];
    arr.forEach(item => aux.push(item._id));
    return aux;
  }
  // icon functions
  iconsNames(arr) {
    arr.map(icon => {
      icon.name = this.replaceBars(icon.icon);
    });
  }

  replaceBars(str) {
    return str.replace(/_/g, ' ');
  }

  onKeyIcon(val) {
    this.selectedIconList = this.search(val);
  }

  search(val: string) {
    let filter = this.iconList.filter(icon => icon.name.toLowerCase().includes(val.toLowerCase()));
    return [...filter];
  }

  comparePages(a, b) {
    const nameA = a.title.toUpperCase();
    const nameB = b.title.toUpperCase();
    let comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
  }

  checkMenuTitles(menuTitle, titlesArr) { // título disponible?
    if (titlesArr.includes(menuTitle)) {
      return false;
    } else return true;
  }

  editTitles(oldTitle, newTitle, titlesArr) { // para cuando se edita puedas guardar si no cambias el título
    let arr = [...titlesArr];
    if (oldTitle === newTitle) {
      let index = arr.indexOf(oldTitle);
      if (index !== -1) arr.splice(index, 1);
    }
    return arr;
  }

  createForm(urlModel?: MenuUrl) {
    const reg = '^((https|http):\\/\\/)?([a-z\\d_]+\\.)?(([a-zA-Z\\d_]+)(\\.[a-zA-Z]{2,6}))(\\/[a-zA-Z\\d_\\%\\-=\\+]+)*(\\?)?([a-zA-Z\\d=_\\+\\%\\-&\\{\\}\\:]+)?';
    if (urlModel) {

      this.formGroup = this.formBuilder.group({
        title: [urlModel.title, Validators.required],
        icon: [urlModel.icon, Validators.required],
        linkType: [urlModel.linkType, Validators.required],
        desc: [urlModel.desc],
        blank: [urlModel.blank, Validators.required],
        iframe: [urlModel.iframe],
        innerLink: [urlModel.innerLink],
        webLink: [urlModel.webLink, Validators.pattern(reg)],
        permissions: [urlModel.permissions, Validators.required]
      });
    } else {
      this.formGroup = this.formBuilder.group({
        title: ['', Validators.required],
        icon: ['', Validators.required],
        linkType: [null, Validators.required],
        desc: [''],
        blank: [false, Validators.required],
        iframe: [false],
        innerLink: [''],
        webLink: [''],
        permissions: [[], Validators.required]
      });
    }
  }

  addNewUrl() {
    let url = this.formGroup.getRawValue();
    if (this.formGroup.value.title === '' || this.formGroup.value.icon === ''
      || this.formGroup.value.linkType === null) return;
    if (this.formGroup.value.linkType) {
      url['innerLink'] = this.selectedUrl.path;
      url['urlId'] = this.selectedUrl.id;
      url['permissions'] = this.selectedUrl.permissions;
      url['services'] = this.selectedUrl.services;
    } else if (!this.formGroup.value.linkType) {
      url['webLink'] = this.formGroup.value.webLink;
      url['iframe'] = this.iframeChecked;
      if (this.allPermissionsSelected) url['permissions'] = this.permissions;
      if (!this.allPermissionsSelected) url['permissions'] = this.formGroup.value.permissions;
    }
    url['children'] = [];
    if (this.formGroup.invalid) {
      this.formGroup.get('title').markAsTouched();
      this.formGroup.get('icon').markAsTouched();
      this.formGroup.get('linkType').markAsTouched();
      this.formGroup.get('innerLink').markAsTouched();
      this.formGroup.get('webLink').markAsTouched();
      this.formGroup.get('permissions').markAsTouched();
      return;
    }
    if (this.checkMenuTitles(this.formGroup.value.title, this.data.titles)) {
      this.close(url);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  editUrl() {
    let url = this.formGroup.getRawValue();
    if (this.formGroup.value.title === '' || this.formGroup.value.icon === ''
      || this.formGroup.value.linkType === null) return;
    if (this.formGroup.value.linkType === true) {
      url['innerLink'] = this.selectedUrl.path;
      delete url.webLink;

      url['urlId'] = this.selectedUrl.id;
      url['permissions'] = this.selectedUrl.permissions;
      url['services'] = this.selectedUrl.services;
    }
    if (this.formGroup.value.linkType === false) {
      url['webLink'] = this.formGroup.value.webLink;
      delete url.innerLink;
      url['iframe'] = this.iframeChecked;
      if (this.allPermissionsSelected) url['permissions'] = this.permissions;
      if (!this.allPermissionsSelected) url['permissions'] = this.formGroup.value.permissions;

    }
    url['children'] = [];
    let auxTitles = this.editTitles(this.data.block.title, this.formGroup.value.title, this.titlesList);
    if (this.checkMenuTitles(this.formGroup.value.title, auxTitles)) {
      this.titlesList = auxTitles.slice(0);
      this.close(url);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  onChange(value: MatSlideToggleChange) {
    setTimeout(() => this.isChecked = value.checked, 0);
    if (value.checked === true) {
      this.iframeChecked = false;
      this.formGroup.patchValue({ 'iframe': false });
    }
  }

  iframe(value: MatSlideToggleChange) {
    setTimeout(() => this.iframeChecked = value.checked, 0);
    if (value.checked === true) {
      this.formGroup.patchValue({ 'blank': false });
      this.isChecked = false;
    }
  }

  onSelectionChange(event) {
    this.type = event.value;
    //force user to select/type again if radio changes to avoid errors at create/edit
    this.formgroupControl(this.type);
    this.addEnabledUrl = false;
    this.addEnabledUrl2 = false;
    this.iframeChecked = false;

  }

  formgroupControl(state) {
    const reg = '^((https|http):\\/\\/)?([a-z\\d_]+\\.)?(([a-zA-Z\\d_]+)(\\.[a-zA-Z]{2,6}))(\\/[a-zA-Z\\d_\\%\\-=\\+]+)*(\\?)?([a-zA-Z\\d=_\\+\\%\\-&\\{\\}\\:]+)?';
    if (state === true) {
      this.formGroup.controls['innerLink'].enable();
      this.formGroup.controls['innerLink'].setValidators([Validators.required]);
      this.formGroup.controls['webLink'].disable();
      this.formGroup.controls['permissions'].disable();
      this.formGroup.patchValue({ 'iframe': false });
    } else if (state === false) {
      this.formGroup.controls['webLink'].enable();
      this.formGroup.controls['permissions'].enable();
      this.formGroup.controls['webLink'].setValidators([Validators.required, Validators.pattern(reg)]);
      this.formGroup.controls['permissions'].setValidators([Validators.required]);
      this.formGroup.controls['innerLink'].disable();
    }
    this.formGroup.updateValueAndValidity();
  }

  onTitleChange(value: string) {
    this.addEnabledTitle = true;
  }

  onLabelChange(value: string) {
    this.addEnabledUrl = true;
    if (value === '') this.formGroup.controls['webLink'].setErrors({ 'incorrect': true });
  }

  onIconChange() {
    this.addEnabledType = true;
  }

  urlChange(event) {
    this.addEnabledUrl2 = true;
    let aux = this.pages.find(item => item.id === event.value);
    this.selectedUrl = aux;
  }

  urlChangePermissions(event) {
    if (event.value[0] === 'todosPermisos') {
      this.allPermissionsSelected = true;
    } else {
      this.allPermissionsSelected = false;
    }
    this.addEnabledPermissions = true;
  }

  toggleNone() {
    if (this.ninguno.selected) {
      if (this.todos.selected) this.allPermissionsSelected = false;
      this.formGroup.controls.permissions.patchValue([]);
    }
  }

  close(data?) {
    this.dialogRef.close(data);
  }
}
