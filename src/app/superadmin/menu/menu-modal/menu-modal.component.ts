import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatSelectChange, MatOption } from '@angular/material';
import * as icons from '../../../../assets/maticons.json';
import { ApiService } from 'src/app/shared/services/api.service';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
@Component({
  selector: 'app-menu-modal',
  templateUrl: './menu-modal.component.html',
  styleUrls: ['./menu-modal.component.scss']
})
export class MenuModalComponent implements OnInit {

  formGroupMenu: FormGroup;
  formGroupBlock: FormGroup;
  addEnabledTitle = false;
  addEnabledType = false;
  iconList: any = (icons as any).default;
  selectedIconList;
  selectedIconItem;
  roles = [];
  allRolesSelected = false;
  @ViewChild('todos') private todos: MatOption;
  @ViewChild('ninguno') private ninguno: MatOption;
  selectedRol = [];
  fromCreateMenu = false;
  fromEditMenu = false;
  fromCreateBlock = false;
  fromEditBlock = false;
  titlesList = [];
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MenuModalComponent>,
    private apiService: ApiService,
    private translate: TranslateService,
    private logsService: LogsService
  ) { }
  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.menu.titleError'
    ];
    this.getLogsTranslations();
    this.iconsNames(this.iconList);
    this.selectedIconList = this.iconList;
    this._getRols();
    // Control forms autofill, modal display buttons and logic of create/edit
    if (this.data.fromCreateMenu) {
      this.createFormMenu();
      this.fromCreateMenu = true;
    } else if (this.data.fromCreateBlock) {
      this.createFormBlock();
      this.fromCreateBlock = true;
      this.titlesList = this.data.titles;
    } else if (this.data.fromEditBlock) {
      this.createFormBlock();
      this.fromEditBlock = true;
      this.titlesList = this.data.titles;
      this.selectedIconItem = this.data.block.icon;
      this.formGroupBlock = this.formBuilder.group({
        title: [this.data.block.title, Validators.required],
        icon: [this.data.block.icon, Validators.required],
        desc: [this.data.block.desc]
      });
      this.selectedIconItem = this.formGroupBlock.value.icon;
    }
  }

  private _getRols() {
    this.apiService.getAllRols().subscribe((data) => {
      this.roles = data;
      if (this.data.fromEditMenu) {
        // Filtrado para marcar roles automáticamente al editar
        this.data.elem.roles.forEach(item => {
          this.roles.forEach(elem => {
            if (elem._id === item) this.selectedRol.push(elem);
          });
        });
        this.fromEditMenu = true;
        this.selectedIconItem = this.data.elem.icon;
        this.formGroupMenu = this.formBuilder.group({
          title: [this.data.elem.title, Validators.required],
          icon: [this.data.elem.icon, Validators.required],
          rol: [this.selectedRol, Validators.required],
          manager: [this.data.elem.manager]
        });
        this.selectedIconItem = this.formGroupMenu.value.icon;
      }
    });
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  createFormMenu() {
    this.formGroupMenu = this.formBuilder.group({
      title: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      rol: [[], [Validators.required]],
      manager: [false]
    });
  }

  createFormBlock() {
    this.formGroupBlock = this.formBuilder.group({
      title: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      desc: [null],
    });
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

  addNewMenu() {
    let menu = this.formGroupMenu.getRawValue();
    if (this.formGroupMenu.value.title === '' || this.formGroupMenu.value.icon === '') return;
    if (this.allRolesSelected) menu['roles'] = this.roles;
    if (!this.allRolesSelected) menu['roles'] = this.formGroupMenu.value.rol;
    if (this.checkMenuTitles(this.formGroupMenu.value.title, this.data.titles)) {
      this.close(menu);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  editMenu() {
    let menu = this.formGroupMenu.getRawValue();
    let data = [];
    if (this.formGroupMenu.value.title === '' || this.formGroupMenu.value.icon === '') return;
    menu['blocks'] = this.data.elem.blocks;
    menu['status'] = this.data.elem.status;
    if (this.allRolesSelected) menu['roles'] = this.roles;
    if (!this.allRolesSelected) menu['roles'] = this.formGroupMenu.value.rol;
    let auxTitles = this.editTitles(this.data.elem.title, this.formGroupMenu.value.title, this.data.titles);
    if (this.checkMenuTitles(this.formGroupMenu.value.title, auxTitles)) {
      const index = auxTitles.indexOf(this.data.elem.title);
      if (index !== -1) auxTitles[index] = this.formGroupMenu.value.title;
      data.push(menu);
      data.push(auxTitles); // para actualizar los títulos de menús si no se vuelve al menú principal
      this.close(data);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  checkMenuTitles(menuTitle, titlesArr) { // título disponible?
    if (titlesArr.includes(menuTitle)) {
      return false;
    } else return true;
  }

  editTitles(oldTitle, newTitle, titlesArr) { // para cuando se edita puedas guardar si no cambias el título
    let arr = [...titlesArr];
    if (oldTitle === newTitle) {
      const index = arr.indexOf(oldTitle);
      if (index !== -1) arr.splice(index, 1);
    }
    return arr;
  }

  addNewBlock() {
    let block = this.formGroupBlock.getRawValue();
    if (this.formGroupBlock.value.title === '' || this.formGroupBlock.value.icon === '' || this.formGroupBlock.value.desc === '') return;
    block['children'] = [];
    if (this.checkMenuTitles(this.formGroupBlock.value.title, this.data.titles)) {
      this.close(block);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  editBlock() {
    let block = this.formGroupBlock.getRawValue();
    block['children'] = this.data.block.children;
    let auxTitles = this.editTitles(this.data.block.title, this.formGroupBlock.value.title, this.titlesList);
    if (this.checkMenuTitles(this.formGroupBlock.value.title, auxTitles)) {
      this.titlesList = auxTitles.slice(0);
      this.close(block);
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.titleError']);
    }
  }

  onTitleChange(value: string) {
    this.addEnabledTitle = true;
  }

  onIconChange() {
    this.addEnabledType = true;
  }

  onRolChange(event: MatSelectChange) {
    if (event.value[0] === 'todosRoles') {
      this.allRolesSelected = true;
    } else {
      this.allRolesSelected = false;
    }
  }

  toggleNone() {
    if (this.ninguno.selected) {
      if (this.todos.selected) this.allRolesSelected = false;
      this.formGroupMenu.controls.rol.patchValue([]);
    }
  }

  manager(event) {
    this.formGroupMenu.get('manager').patchValue(event.checked);
  }

  close(data?) {
    this.dialogRef.close(data);
  }
}
