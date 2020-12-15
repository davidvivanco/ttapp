import { Component, OnInit } from '@angular/core';
import { MenuModalComponent } from './menu-modal/menu-modal.component';
import { MatDialog } from '@angular/material';
import { MenuService } from './../../shared/services/menu.service';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { ApiService } from 'src/app/shared/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/shared/services/event.service';
import { UrlModalComponent } from './url-modal/url-modal.component';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  menuList = [];
  menuTitles = [];
  rolesTextView: any = {};
  roles = [];
  selectedRoles = [];
  loading = false;
  canPublishAll = false;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;
  constructor(public dialog: MatDialog,
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private logsService: LogsService,
    private apiService: ApiService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.getMenus();

    this.logsMessagesKeys = [
      'logsMessages.menu.deleteMenu',
      'logsMessages.menu.save',
      'logsMessages.menu.cancel',
      'logsMessages.menu.saveError',
    ];
    this.getLogsTranslations();
  }

  addMenu() {
    const dialog = this.dialog.open(MenuModalComponent, {
      data: {
        fromCreateMenu: true,
        titles: this.menuTitles
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe(async (res: any) => {
      if (!res) return;
      if (res) {
        this.menuList.push(res);
        this.loading = true;
        await this.onSave();
        await this.getMenus();
        const menuRolesView = await this.processOneRolView(this.menuList[this.menuList.length - 1]);
        this.loading = false;
        this.router.navigate([`edit/${this.menuList[this.menuList.length - 1]._id}`], {
          relativeTo: this.route,
          state: { data: { rolesView: menuRolesView, titles: this.menuTitles } }
        });
      }
    });
  }

  addDirectUrl() {
    const dialog = this.dialog.open(UrlModalComponent, {
      data: {
        block: {},
        fromCreateUrl: true,
        titles: this.menuTitles
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe((res: any) => {
      if (!res) return;
      if (res) {
        res.status = 'draft';
        this.menuList.push(res);
        this.onSave(false);
      }
    });
  }

  onSave(showMsg?) {
    return new Promise((response, rej) => {
      this.menuService.updateAll(this.menuList).subscribe((res) => {
        this.menuList = res;
        this.eventService.menuEmitter.emit(this.menuList);
        this.setCanPublish(this.menuList);
        this.menuTitles = this.getMenuTitles(this.menuList);
        response(this.menuList);
        if (showMsg === true) this.logsService.log(this.logsMessagesTranslations['logsMessages.menu.save']);
      }, err => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.menu.saveError']);
      });
    });
  }

  publishUrlChange(menu, index) {
    const msg = menu.status === 'published' ?
      `¿Desea despublicar el enlace directo ${menu.title}?` :
      `¿Desea publicar el enlace directo ${menu.title}?`;
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `¡Atención!`,
        message: msg
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        if (menu.status === 'published') {
          this.menuList[index].status = 'draft';
        } else this.menuList[index].status = 'published';
        this.onSave(true);
      } else {
        dialog.close();
      }
    });
  }

  publishAll() {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `¡Atención!`,
        message: `¿Desea publicar todos los menús?`
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menuList.forEach(menu => {
          menu.blocks.forEach(subMenu => {
            if (subMenu.linkType === true || subMenu.linkType === false) {
              menu.status = 'published';
            } else {
              if (subMenu.children.length > 0) {
                menu.status = 'published';
              }
            }
          });
          // publicar accesos directos
          if (menu.hasOwnProperty('linkType') && menu.status === 'draft') menu.status = 'published';
        });
        this.onSave(true);
      } else {
        dialog.close();
      }
    });
  }

  editMenu(menu) {
    this.router.navigate([`edit/${menu._id}`], {
      relativeTo: this.route, state: {
        data: {
          rolesView: this.rolesTextView[menu._id],
          titles: this.menuTitles
        }
      }
    });
  }

  editUrl(url, urlIndex) {
    const dialog = this.dialog.open(UrlModalComponent, {
      // llamamos block al elemento para aprovechar código de la modal
      data: {
        block: url,
        fromEditUrl: true,
        urlId: url.urlId,
        permissions: url.permissions,
        titles: this.menuTitles
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe((data => {
      if (!data) return;
      if (data) {
        data.status = url.status;
        this.menuList[urlIndex] = data;
        this.menuTitles = this.getMenuTitles(this.menuList);
        this.onSave(false);
      }
    }));
  }

  processRolView(MenuList) {
    MenuList.map(menu => {
      this.apiService.getAllRols().subscribe((data) => {
        const totalRols = [];
        this.roles = data;
        menu.roles.forEach(item => {
          this.roles.forEach(elem => {
            if (elem._id === item) totalRols.push(elem.name);
          });
        });
        // importante que esté primero allRolesString
        const allRolesString = totalRols.toString(); // Para utilizar en la vista de edit en el "ver más" || "ver menos"
        const rolesProcessed = this.processThisMenuRoles(totalRols);
        this.rolesTextView[menu._id] = { rolesView: rolesProcessed, allRoles: allRolesString }; // crear objeto al vuelo
      });
    });
  }

  processOneRolView(menu) { // pasar roles al añadir menú nuevo
    return new Promise((response, rej) => {
      this.apiService.getAllRols().subscribe((data) => {
        const totalRols = [];
        this.roles = data;
        menu.roles.forEach(item => {
          this.roles.forEach(elem => {
            if (elem._id === item) totalRols.push(elem.name);
          });
        });
        // importante que esté primero allRolesString
        const allRolesString = totalRols.toString(); // Para utilizar en la vista de edit en el "ver más" || "ver menos"
        const rolesProcessed = this.processThisMenuRoles(totalRols);
        const aux = { rolesView: rolesProcessed, allRoles: allRolesString };
        response(aux);
      });
    });
  }

  processThisMenuRoles(array) {
    if (array.length > 3) {
      // Cortar longitud del array a 3 y entonces los devolvemos
      const shortened = `${array.splice(0, 3)}...`;
      return shortened.toString();
    } else {
      return array.toString();
    }
  }

  getMenus() {
    return new Promise((response, rej) => {
      this.loading = true;
      this.menuService.getMenus().subscribe((res: any) => {
        if (res !== null) {
          this.menuList = res;
          this.processRolView(this.menuList);
          this.eventService.menuEmitter.emit(this.menuList);
          this.setCanPublish(this.menuList);
          this.menuTitles = this.getMenuTitles(this.menuList);
          response(this.menuList);
        }
        this.loading = false;
      });

    });
  }

  getMenuTitles(menus) {
    let arr = [];
    menus.forEach(m => arr.push(m.title));
    arr.push('admin');
    arr.push('superAdmin');
    return arr;
  }


  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  deleteMenu(menu, index) {
    const deleteMsg = menu.status === 'published' ?
      'Si acepta eliminará el menú publicado, ¿desea continuar?' :
      '¿Desea eliminar este menú?';
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Eliminar ${menu.title}`,
        message: deleteMsg
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.menuList.splice(index, 1);
        this.logsService.log(this.logsMessagesTranslations['logsMessages.menu.deleteMenu']);
        this.onSave(false);
      }
    });
  }

  setCanPublish(menuList) {
    /*
    publicar todo sólo si:
    Hay enlaces directos sin publicar
    Hay menús sin publicar y que tengan enlaces o que sus submenús tengan enlaces
    */
    this.canPublishAll = false;
    const nonPublished = menuList.filter(menu => menu.status === 'draft');
    nonPublished.map(menu => {
      if (menu.hasOwnProperty('linkType')) this.canPublishAll = true;
      menu.blocks.map(subMenu => {
        if (subMenu.hasOwnProperty('linkType')) {
          this.canPublishAll = true;
        } else {
          if (subMenu.children.length !== 0) this.canPublishAll = true;
        }
      });
    });
    return this.canPublishAll;
  }

  dropMenu(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menuList, event.previousIndex, event.currentIndex);
    this.onSave(true);
  }
}
