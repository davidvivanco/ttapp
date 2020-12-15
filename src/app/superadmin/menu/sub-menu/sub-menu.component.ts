import { Component, OnInit } from '@angular/core';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from 'src/app/shared/services/menu.service';
import { MatDialog } from '@angular/material';
import { MenuModalComponent } from '../menu-modal/menu-modal.component';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { UrlModalComponent } from '../url-modal/url-modal.component';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { Location } from '@angular/common';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { EventService } from 'src/app/shared/services/event.service';
import { ComponentCanDeactivate } from 'src/app/shared/services/canDeactivate.guard';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.scss']
})
export class SubMenuComponent implements OnInit, ComponentCanDeactivate {
  menu: any = {};
  // getExtras
  menuTitles = [];
  titlesList = [];
  // si el menú es nuevo
  title;
  icon;
  roles;
  manager;
  rolesTextView: any = {};
  rolView: string;
  rolViewFlag = true;
  elipsis; // show/hide ver más
  subMenuIndex; // D&D
  loading = false;
  newChanges = false;
  isNewMenu = true;
  menuId: string;
  canPublish = false;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;
  constructor(public dialog: MatDialog,
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private logsService: LogsService,
    private _location: Location,
    private eventService: EventService,
  ) {
    this.menuId = this.route.snapshot.paramMap.get('id');
    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
      this.rolesTextView = this.router.getCurrentNavigation().extras.state.data.rolesView;
      this.rolView = this.rolesTextView.rolesView;
      this.elipsis = this.rolesTextView.allRoles === this.rolesTextView.rolesView ? false : true;
      this.menuTitles = this.router.getCurrentNavigation().extras.state.data.titles;
    }
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.menu.save',
      'logsMessages.menu.cancel',
      'logsMessages.menu.saveError',
      'logsMessages.menu.deleteSuccess'
    ];
    this.getLogsTranslations();
    if (this.menuId) {
      this.isNewMenu = false;
      this.menuService.getMenu(this.menuId).subscribe(res => {
        if (!res) return;
        this.menu = res;
        this.titlesList = this.getTitles(this.menu);
      });
    }
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  getMenuTitles(menus) {
    let arr = [];
    menus.forEach(m => arr.push(m.title));
    return arr;
  }

  getTitles(menu) { // para controlar disponibilidad de los títulos
    let arr = [];
    if (menu.blocks.length > 0) {
      menu.blocks.forEach(m => {
        arr.push(m.title);
        if (m.children && m.children.length > 0) {
          m.children.forEach(url => arr.push(url.title));
        }
      });
    }
    return arr;
  }

  addBlock() {
    const dialog = this.dialog.open(MenuModalComponent, {
      data: {
        fromCreateBlock: true,
        titles: this.titlesList
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe(((res: string) => {
      if (!res) return;
      if (res) {
        this.menu['blocks'].push(res);
        this.newChanges = true;
        this.titlesList = this.getTitles(this.menu);
      }
    }));
  }

  addUrl() {
    const isPublished = 'Este menú está publicado, si añade un enlace se verá automáticamente en el menú lateral';
    if (this.menu.status === 'published') {
      const dialog2 = this.dialog.open(DeleteModalComponent, {
        data: {
          title: `Añadir enlace en ${this.menu['title']}`,
          message: isPublished
        }
      });
      dialog2.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.urlAddDialog();
        } else {
          dialog2.close();
        }
      });
    } else {
      this.urlAddDialog();
    }
  }

  urlAddDialog() {
    const dialog = this.dialog.open(UrlModalComponent, {
      data: {
        block: {},
        fromCreateUrl: true,
        titles: this.titlesList
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe(((res: string) => {
      if (!res) return;
      if (res) {
        this.menu['blocks'].push(res);
        this.newChanges = true;
        this.titlesList = this.getTitles(this.menu);
      }
    }));
  }

  editMenuModal() {
    const dialog = this.dialog.open(MenuModalComponent, {
      data: { elem: this.menu, fromEditMenu: true, titles: this.menuTitles }, autoFocus: false
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.refreshMenuRolesView(data);
        this.menu = Object.assign({}, data[0]);
        this.menu['roles'] = [];
        data[0].roles.forEach(element => {
          this.menu['roles'].push(element._id);
        });
        this.newChanges = true;
        this.menuTitles = data[1].slice(0); // acttualiza titulos sólo en edit
      }
    });
  }

  refreshMenuRolesView(data) { // actualizar vista cuando se cambian roles editando menú
    this.rolesTextView['allRoles'] = '';
    this.rolesTextView['rolesView'] = '';
    this.rolesTextView['allRoles'] += data[0].roles.map(rol => rol.name);
    if (data[0].roles.length > 3) {
      for (let i = 0; i < 3; i++) {
        this.rolesTextView['rolesView'] += data[0].roles[i].name;
        i === 2 ? this.rolesTextView['rolesView'] += '...' : this.rolesTextView['rolesView'] += ',';
      }
    } else {
      this.rolesTextView['rolesView'] = this.rolesTextView['allRoles'];
      this.rolView = this.rolesTextView['allRoles'];
    }
    this.elipsis = this.rolesTextView.allRoles === this.rolesTextView.rolesView ? false : true;
  }

  editBlock(block, blockIndex) {
    if (this.hasProp(block, 'linkType')) { // enlace
      const dialog = this.dialog.open(UrlModalComponent, {
        data: {
          block: block,
          fromEditUrl: true,
          urlId: block.urlId,
          titles: this.titlesList,
          permissions: block.permissions
        }, autoFocus: false
      });
      dialog.afterClosed().subscribe((data => {
        if (!data) return;
        if (data) {
          this.menu['blocks'].splice(blockIndex, 1, data);
          this.newChanges = true;
          this.titlesList = this.getTitles(this.menu); // update titles
        }
      }));
    } else if (!this.hasProp(block, 'linkType')) { // subMenu
      const dialog = this.dialog.open(MenuModalComponent, {
        data: { block: block, fromEditBlock: true, titles: this.titlesList }, autoFocus: false
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.menu['blocks'][blockIndex] = data;
          this.newChanges = true;
          this.titlesList = this.getTitles(this.menu); // update titles
        }
      });
    }
  }

  editUrl(url, blockIndex, urlIndex) {
    const dialog = this.dialog.open(UrlModalComponent, {
      // llamamos block al elemento para aprovechar código de la modal
      data: {
        block: url,
        fromEditUrl: true,
        urlId: url.urlId,
        permissions: url.permissions,
        titles: this.titlesList
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe((data => {
      if (!data) return;
      if (data) {
        this.menu['blocks'][blockIndex].children[urlIndex] = data;
        this.newChanges = true;
        this.titlesList = this.getTitles(this.menu); // update titles
      }
    }));
  }

  deleteMenu() {
    const deleteMsg = this.menu.status === 'published' ?
      'Si acepta eliminará el menú publicado, ¿desea continuar?' :
      '¿Desea eliminar este menú?';
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Eliminar ${this.menu['title']}`,
        message: deleteMsg
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menuService.deleteOne(this.menuId).subscribe(res => {

          this.onReturn();
        });
      }
    });
  }

  deleteUrl(url, blockIndex, subUrlIndex) {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Eliminar ${url.title}`,
        message: `¿Desea eliminar este enlace?`
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menu['blocks'][blockIndex].children.splice(subUrlIndex, 1);
        this.newChanges = true;
        this.titlesList = this.getTitles(this.menu); // update titles
      }
    });
  }

  deleteBlock(block, blockIndex) {
    const name = block.linkType ? 'enlace' : 'bloque';
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Eliminar ${block.title}`,
        message: `¿Desea eliminar este ${name}?`
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menu['blocks'].splice(blockIndex, 1);
        this.newChanges = true;
        this.titlesList = this.getTitles(this.menu); // update titles
      }
    });
  }

  onSave() {
    this.canStillPublished();
    this.menuService.updateOne(this.menuId, this.menu).subscribe((res) => {
      this.menu = res;
      this.newChanges = false;
      this.eventService.oneMenuEmitter.emit(this.menu);
      this.logsService.log(this.logsMessagesTranslations['logsMessages.menu.save']);
    }, err => {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.saveError']);
    });
  }

  onCancel() {
    // confirmation modal
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Confirmación`,
        message: 'Tiene cambios sin guardar, ¿está seguro que quiere volver?'
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.onReturn();
        this.logsService.log(this.logsMessagesTranslations['logsMessages.menu.cancel']);
      } else {
        dialog.close();
      }
    });
  }

  onReturn() {
    this._location.back();
  }

  verMas() {
    if (this.rolViewFlag) {
      this.rolView = this.rolesTextView['allRoles'];
      this.rolViewFlag = !this.rolViewFlag;
    } else {
      this.rolView = this.rolesTextView['rolesView'];
      this.rolViewFlag = !this.rolViewFlag;
    }
  }

  publish() {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Publicar ${this.menu.title}`,
        message: `¿Desea publicar este menú?`
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {

        this.menu.blocks.map(subMenu => {
          if (subMenu.linkType === true || subMenu.linkType === false) {
            this.menu.status = 'published';
            this.newChanges = true;
          } else {
            if (subMenu.children.length > 0) {
              this.menu.status = 'published';
              this.newChanges = true;
            }
          }
        });
        this.onSave();
      } else {
        dialog.close();
      }
    });
  }

  unPublish() {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Despublicar ${this.menu.title}`,
        message: `¿Desea despublicar este menú?`
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menu.status = 'draft';
        this.newChanges = true;
        this.onSave();
      } else {
        dialog.close();
      }
    });
  }

  canStillPublished() { // Comprobar al guardar que queden enlaces para que siga publicado
    let hasUrl = false;
    this.menu.blocks.forEach(subMenu => {
      if (subMenu.linkType === true || subMenu.linkType === false) {
        hasUrl = true;
      } else {
        if (subMenu.children.length > 0) {
          hasUrl = true;
        }
      }
    });
    if (hasUrl === false) {
      this.canPublish = false;
      this.menu.status = 'draft';
    } else {
      this.canPublish = true;
    }
  }

  hasProp(item, name) {
    return item.hasOwnProperty(name);
  }

  // D&D functions
  onDragStart(event: DragEvent, i) {
    // auxiliar para cuando se realiza una acción no permitida con carpetas
    this.subMenuIndex = i;
  }

  onDragged(item: any, list: any[], effect: DropEffect) {
    if (effect === 'move') {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  onDrop(event: DndDropEvent, list?: any[], type?: string) {
    if (list
      && (event.dropEffect === 'copy'
        || event.dropEffect === 'move')) {
      let index = event.index;
      if (typeof index === 'undefined') {
        index = list.length;
      }
      list.splice(index, 0, event.data);
      this.newChanges = true;
    }
  }

  onDrop2(event: DndDropEvent, list?: any[]) {
    if (!event.type.hasOwnProperty('linkType')) {
      // no permitido, copiar objeto en el mismo sitio que estaba
      this.menu.blocks.splice(this.subMenuIndex, 0, event.data);
      return;
    }
    if (list
      && (event.dropEffect === 'copy'
        || event.dropEffect === 'move')) {
      let index = event.index;
      if (typeof index === 'undefined') {
        index = list.length;
      }
      list.splice(index, 0, event.data);
      this.newChanges = true;
    }
  }

  canDeactivate() {
    return !this.newChanges;
  }
}
