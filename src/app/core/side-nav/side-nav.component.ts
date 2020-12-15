import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Employee } from '../../shared/models/employee.model';
import { UserService } from '../../shared/services/user.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { CheckInOutModalComponent } from '../../shared/components/shared/modals/checkinout-modal/checkInOut-modal.component';
import { MatDialog } from '@angular/material';
import { EventService } from 'src/app/shared/services/event.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html'
})
export class SideNavComponent implements OnInit, OnDestroy {

  @Input() employee: Employee;
  title: string;
  structure: any;

  @Input()
  set menu(menu) {
    if (menu) this.title = menu;
  }

  @Input()
  set sideNavBlocks(obj) {
    // console.log('SN:', obj);
    if (obj && obj !== 'default') {
      this.structure = obj.blocks;
      // Obtener permisos user
      let tempPerms = [].concat(...this.userService.getUser().roles.map((r) => r['permissions'])).map((p) => p['_id']);
      tempPerms = tempPerms.filter((item, index) => tempPerms.indexOf(item) === index);
      // Checkar permisos
      if (this.structure) this.structure = this.filterStructure(this.structure, tempPerms);
    } else if (obj === 'default') {
      this.structure = 'default'; // Para menus NO editables como admin y guidelines
    }
  }

  @Input() talentooModules: {};
  @Input() hasPermissions: {};
  @Input() hasServices: {};
  @Output() clickedMenu = new EventEmitter<boolean>();

  permissions;
  config;
  user;
  managerUrlIds = ['fichajes-de-mi-equipo', 'mi-equipo'];

  constructor(
    private userService: UserService,
    public configurationService: ConfigurationService,
    public dialog: MatDialog,
    // private menuService: MenuService,
    private eventService: EventService, // ToDo -> Adaptar a nuevo sistema de servicios
    // private router: Router
  ) { }

  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    this.config = this.configurationService.getConfiguration();
    this.user = this.userService.getUser();
    /* ToDo -> Hace falta??? 
    const subscription = this.eventService.menuEmitter.subscribe((menu) => {
      this.menuList = menu;
    });
    this.eventService.setSubscription(subscription);
    */
  }

  hasProp(item, name) {
    return item.hasOwnProperty(name);
  }

  hideMenu() {
    this.clickedMenu.emit(true);
  }

  openFichajeDialog() {
    const title = 'Fichar';
    this.dialog.open(CheckInOutModalComponent, { width: '400px', data: { title: title }, autoFocus: false });
  }

  modalType(url) {
    switch (url.urlId) {
      case 'fichar':
        this.openFichajeDialog();
        break;
    }
  }

  filterStructure(arr, userPerms) {
    // Funcion que determina que enlaces de este menu vamos a pintar al usuario
    const tempArr = [];
    arr.map((e, i) => {
      if (e.hasOwnProperty('linkType')) {
        if (e.permissions.length === 0) tempArr.push(e);
        else {
          const x = e.permissions.some(p => userPerms.includes(p)); // Tengo los permisos??
          if (x) {
            const found = this.managerUrlIds.includes(e.urlId);
            if (found && this.user.isManager) tempArr.push(e); // Si es un link de manager
            else if (!found) tempArr.push(e);
          }
        }
      } else if (!e.hasOwnProperty('linkType') && e.children.length !== 0) { // filtrar enlaces de children
        const child = [...e.children];
        e.children = [];
        tempArr.push(e);
        child.forEach(url => {
          if (url.permissions.length === 0) tempArr.find(item => item.title === e.title).children.push(url);
          else {
            const x = url.permissions.some(p => userPerms.includes(p)); // Tengo los permisos??
            if (x) {
              const found = this.managerUrlIds.includes(url.urlId);
              if (found && this.user.isManager) tempArr.find(item => item.title === e.title).children.push(url); // Si es un link de manager
              else if (!found) tempArr.find(item => item.title === e.title).children.push(url);
            }
          }
          // borrar carpetas vacías después del filtrado
          const el = tempArr.find(item => item.title === e.title);
          if ( el && el.children.length === 0) tempArr.splice(tempArr.indexOf(item => item.title === e.title), 1);
        });
      }
    });
    return tempArr;
  }

  closeMenuMobile() {
    this.clickedMenu.emit(true);
  }

}
