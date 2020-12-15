import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatDrawer, MatDialog, MatBottomSheet, MatMenuTrigger } from '@angular/material';
import { SearchModalComponent } from '../search/search-modal/search-modal.component';
import { ApiService } from '../shared/services/api.service';
import { UserService } from '../shared/services/user.service';
import { Employee } from '../shared/models/employee.model';
import { ConfigurationService } from '../shared/services/configuration.service';
import { ConfigurationCompany, Services } from '../shared/models/configuration.model';
import { EventService } from '../shared/services/event.service';
import { environment } from '../../environments/environment';
import { Surveys } from '../shared/models/survey.model';
import { SurveyModalComponent } from '../shared/components/shared/modals/survey-modal/survey-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { version } from '../../../package.json';
import { MenuService } from './../shared/services/menu.service';
import { CheckInOutModalComponent } from '../shared/components/shared/modals/checkinout-modal/checkInOut-modal.component';
import { BottomMenuComponent } from './bottom-menu/bottom-menu.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {

  appEnv = environment; // Genial lo de haber llamado a company igual que environment de la app ;)
  public environment: ConfigurationCompany;
  public mobileQuery = false;
  public drawerOpened: boolean;
  public openMenu: boolean;
  public menu: string;
  public sideNavBlocks = {};
  public logOutUrl = '/login';
  public controlPanel: boolean;
  public services: Services;
  public chatBotHidden: boolean[];
  botList = [];
  @ViewChild('botTrigger') botTrigger: MatMenuTrigger;
  version = version;
  menuList;
  permissionList;
  neededPemissions = [];
  userRoles;
  userPermissions = [];
  hasRoles = {};
  hasPermissions = {};
  userServices = [];
  hasServices = {};
  managerList = ['5d23f2399bbb9344a805ef28', '5ee2434f52fae72ed2904fa6', '5d23f27fe6ccef44a876a7e6'];
  managerUrlIds = ['fichajes-de-mi-equipo', 'mi-equipo'];
  hasManager = {};
  urlPaths = {};
  selected = {
    'admin': false,
    'superAdmin': false,
    'bots': false
  };
  forceDrawerClose = false;
  menuLengthMax = false;
  menuSliceB = [];

  @ViewChild(MatDrawer) public drawer: MatDrawer;

  public user: Employee;
  public permissions;
  talentooModules = {};
  public permissionsMap;
  showAdminMenu = false;
  modalActiveEmbed = false;
  adminMenu = ['buscar_todos_card_position', 'actualizar_employees', 'actualizar_rol'];

  // MEDIA MODAL
  showMediaModal = false;
  mediaToShow = {};

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private apiService: ApiService,
    private eventService: EventService,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    public configurationService: ConfigurationService,
    private sanitizer: DomSanitizer,
    private menuService: MenuService,
    private _bottomSheet: MatBottomSheet,
    breakpointObserver: BreakpointObserver
  ) {
    // MediaQuery Matcher
    breakpointObserver.observe([
      '(max-width: 1024px)'
    ]).subscribe(result => {
      if (result.matches) this.mobileQuery = true;
      else this.mobileQuery = false;
    });
    this.environment = this.configurationService.getConfiguration();
    this.chatBotHidden = [];
    if (this.environment.company.bots && this.environment.company.bots.length) this.prepareBots();
    this.checkModules(this.environment.company.companyInfo);
  }

  ngOnInit() {
    this.getMenus();
    this.services = this.configurationService.getConfiguration().services;
    this.trueServices(this.services);
    this.user = this.userService.getUser();
    const menuUpdatedSubscription = this.eventService.oneMenuEmitter.subscribe(res => {
      const index = this.menuList.findIndex(menu => menu._id === res._id);
      if (index !== -1) this.menuList[index] = res;
      this.getMenus();

    });
    this.eventService.setSubscription(menuUpdatedSubscription);
    const subscription = this.eventService.menuEmitter.subscribe((menu) => {
      this.menuList = this.filterMenu(menu.filter(e => e.status === 'published'));
      if (this.mobileQuery) this.menuLengthMax = this.checkMenuLength(this.menuList);
      this.checkPermissionsMenu(this.menuList); // refresh permissions if menu changes
    });
    this.eventService.setSubscription(subscription);
    setTimeout(() => {
      if (this.router.url !== '/finalizacion-registro') this.checkPendingSurveys();
    });
    if (!this.user) {
      this.router.navigate(['/login']);
    } else { this.permissions = this.userService.getPermissions(); }
    this.getUserPermissions(this.user);
    this.permissionsMap = new Map(Object.entries(this.permissions));
    this.userRoles = this.user.roles;
    this.setShowControlPanelMenu();

    this.openMenu = false; // !this.mobileQuery;
    this.drawerOpened = false; // !this.mobileQuery;
    this.setShowAdminMenu(); // busco si tiene permisos de admin para ver el menu de admin
    const changePhotoEmitterSubscription = this.eventService.changePhotoEmitter.subscribe((employee) => {
      this.user = this.userService.getUser();
    });
    this.eventService.setSubscription(changePhotoEmitterSubscription);
    const changeLogoSubscription = this.eventService.changeLogosEmitter.subscribe((event) => {
      // Get config again to update logo image
      if (event) this.environment = this.configurationService.getConfiguration();
      this.eventService.setSubscription(changeLogoSubscription);
    });
    const showMediaModalSubscription = this.eventService.showMediaModal.subscribe((event) => {
      if (event.show) {
        this.showMediaModal = true;
        this.mediaToShow = { url: event.urlMedia, type: event.typeMedia };
      }
    });
    this.eventService.setSubscription(showMediaModalSubscription);
    // En mobiles
    if (this.mobileQuery) {
      const evBottomLaunchModal = this.eventService.bottomLaunchModal.subscribe((data) => {
        this.modalType(data);
      });
      this.eventService.setSubscription(evBottomLaunchModal);
      const evBottomToggleMenu = this.eventService.bottomToggleMenu.subscribe((data) => {
        this.toggleMenu(data.menu, data.noDrawer);
      });
      this.eventService.setSubscription(evBottomToggleMenu);
    }
  }

  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  getMenus() {
    this.menuService.getMenus().subscribe(res => {
      this.menuList = this.filterMenu(res.filter(e => e.status === 'published'));
      if (this.mobileQuery) this.menuLengthMax = this.checkMenuLength(this.menuList);
      this.checkPermissionsMenu(this.menuList);
    });
  }

  filterMenu(arr) {
    // Funcion que determina que menus vamos a pintar al usuario.
    const tempArr = [];
    arr.map(e => {
      if (e.hasOwnProperty('linkType') === false) {
        const x = e.roles.some(v => this.user.roles.find(r => r['_id'] === v));
        if (!e.manager && x) tempArr.push(e);
        else if (e.manager && this.user.isManager) tempArr.push(e); // Si usuario es manager
      } else if (e.hasOwnProperty('linkType') === true) {
        // Obtener permisos user
        let tempPerms = [].concat(...this.userService.getUser().roles.map((r) => r['permissions'])).map((p) => p['_id']);
        tempPerms = tempPerms.filter((item, index) => tempPerms.indexOf(item) === index);
        const y = e.permissions.some(v => tempPerms.includes(v));
        if (y) {
          const isForManager = this.managerUrlIds.includes(e.urlId);
          if (!isForManager) tempArr.push(e);
          else if (isForManager && this.user.isManager) tempArr.push(e);
        }
      }
    });
    return tempArr;
  }

  checkMenuLength(menu) {
    // console.log('checkMenuLength', menu.length);
    const bots = !!this.environment.company.bots.length;
    let l = 4;
    let i = 3;
    if (bots) {
      // Si hay bots necesitamos un hueco más en el menu responsive
      l = l - 1;
      i = i - 1;
    }
    if (!this.showAdminMenu) {
      // Si no es admin no necesitamos la rueda "settings" y hay un hueco más en mobile
      l = l + 1;
      i = i + 1;
    }
    if (menu.length > l) {
      this.spliceMenuForMobile(menu, i);
      return this.menuLengthMax = true;
    }
  }

  spliceMenuForMobile(menu, i) {
    this.menuSliceB = menu.splice(i, menu.length);
    // const chunkA = menu;
  }

  showBottomMenu() {
    if (this.openMenu) {
      this.openMenu = false;
      this.drawer.close();
    }
    this._bottomSheet.open(BottomMenuComponent, { data: this.menuSliceB });
  }

  checkPermissionsMenu(arr) {
    this.setMenuRoles(arr, this.userRoles);
    this.mapMenuList(arr);
    // load default drawer
    this.menu = this.checkRoute();
    if (this.menu === 'admin' || this.menu === 'guidelines') this.sideNavBlocks = 'default';
    else this.sideNavBlocks = arr.find(menu => menu.title === this.menu); // Menú que hay que cargar
    this.selected[this.menu] = true;
    // console.log('MP snb', this.sideNavBlocks);
  }

  checkRoute() {
    /* PARA OPEN CLOSED DE MAT DRAWER */
    const found = this.getUrlObj(this.urlPaths, this.router.url);
    if (found) {
      this.forceDrawerClose = false;
      return found;
    } else {
      return this.menuList[0].title;
    }
  }

  getUrlObj(paths, routeUrl) { // comprobar url para mantener el menú activado al actualizar
    let obj;
    Object.keys(paths).forEach(key => {
      if (routeUrl.includes(key)) {
        obj = paths[key];
      }
    });
    if (routeUrl.includes('/admin')) { // cualquier ruta de admin tiene /admin
      obj = 'admin';
    }
    return obj;
  }

  mapMenuList(menuList) {
    menuList.map(item => {
      // crear objeto al vuelo con un join con el id de permisos de los enlaces y la lista de permisos
      this.selected[item.title] = false;
      this.setDirectUrlPermissionsAndServices(item);
      item.blocks.forEach(block => {
        if (block.hasOwnProperty('linkType')) { // es enlace
          if (block.innerLink && block.innerLink !== '') {
            this.urlPaths[block.innerLink] = item.title;
          } else if (block.webLink && block.webLink !== '') this.urlPaths[this.filterHttpUrl(block.webLink)] = item.title;
          this.setUrlPermissions(block, this.userPermissions); // obj permisos al vuelo
          this.setUrlServices(block); // obj servicios al vuelo
          if (block.permissions.length === 0) this.hasPermissions[block._id] = true; // no necesita permisos->mostrar a todos
          if (block.services.length === 0) this.hasServices[block._id] = true; // no necesita servicios->mostrar a todos
        } else if (!block.hasOwnProperty('linkType')) {// es carpeta
          if (block.children.length > 0) { // la carpeta tiene enlaces
            block.children.forEach(url => {
              this.setUrlPermissions(url, this.userPermissions);
              if (url.innerLink && url.innerLink !== '') {
                this.urlPaths[url.innerLink] = item.title;
              } else if (url.webLink && url.webLink !== '') this.urlPaths[this.filterHttpUrl(url.webLink)] = item.title;
              this.setUrlServices(url);
              if (url.permissions.length === 0) this.hasPermissions[url._id] = true; // no necesita permisos->mostrar a todos
              if (url.services.length === 0) this.hasServices[url._id] = true; // no necesita servicios->mostrar a todos
            });
          }
        }
      });
    });
  }

  setMenuRoles(menuRes, userRoles) {
    menuRes.map(menu => {
      if (this.userHasRoles(userRoles, menu.roles)) { // objeto al vuelo para roles
        this.hasRoles[menu._id] = true;
      } else {
        this.hasRoles[menu._id] = false;
      }
    });
  }

  setDirectUrlPermissionsAndServices(menu) {
    if (menu.hasOwnProperty('linkType')) {
      this.setUrlPermissions(menu, this.userPermissions);
    }
    if (menu.permissions.length === 0) this.hasPermissions[menu._id] = true; // no necesita permisos->mostrar a todos
  }

  getUserPermissions(user) { // objeto con todos los permisos del usuario
    user.roles.map(rol => {
      rol.permissions.map(perm => {
        if (this.userPermissions.indexOf(perm) === -1) this.userPermissions.push(perm);
      });
    });
  }

  trueServices(services) {
    const arr = Object.entries(services);
    if (services.account.active) this.userServices.push('account.active');
    if (services.email.active) this.userServices.push('email.active');
    if (services.translations.active) this.userServices.push('translations.active');
    arr.filter(([key, value]) => value === true).forEach(trueVal => {
      this.userServices.push(trueVal[0]);
    });
  }

  setUrlPermissions(url, userPermissions) {
    if (this.userHasPermissions(userPermissions, url.permissions)) { // objeto al vuelo para permisos
      this.hasPermissions[url._id] = true;
    } else {
      this.hasPermissions[url._id] = false;
    }
  }

  setUrlServices(url) {
    if (this.userHasServices(this.userServices, url.services)) { // objeto al vuelo para servicios
      this.hasServices[url._id] = true;
    } else {
      this.hasServices[url._id] = false;
    }
  }

  userHasPermissions(userPermissions, urlPermissions) {
    let flag = false;
    let found;
    for (let i = 0; i < urlPermissions.length; i++) {
      found = userPermissions.find(item => item._id === urlPermissions[i]);
      if (found) {
        flag = true;
        break;
      }
    }
    if (flag) {
      return true;
    } else return false;
  }

  userHasRoles(userRoles, menuRoles) {
    let flag = false;
    let found;
    let managerFlag = false;
    for (let i = 0; i < userRoles.length; i++) {
      found = menuRoles.find(item => {
        if (item === userRoles[i]._id) {
          return item;
        }
      });
      if (found && this.managerList.includes(found)) {
        if (this.user.isManager) managerFlag = true;
      } else if (found && !this.managerList.includes(found)) {
        flag = true;
      }
    }
    if (flag || managerFlag) {
      return true;
    } else return false; // si el usuario tiene alguno de los roles devuelve true, para crear objeto al vuelo hasRoles
  }

  userHasServices(userServices, serviceNames) {
    for (let index = 0; index < serviceNames.length; index++) {
      if (userServices.includes(serviceNames[index])) return true;
    }
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

  closeMediaModal(event) {
    if (event) this.showMediaModal = false;
  }

  filterHttpUrl(url) { // coger parte derecha del http para web externos en iframe
    const splitUrl = url.split('//');
    return splitUrl[1];
  }

  openingDrawer() {
    this.drawerOpened = !this.drawerOpened;
    this.openMenu = this.drawerOpened;
  }

  closingDrawer() {
    this.drawerOpened = !this.drawerOpened;
    this.openMenu = this.drawerOpened;
  }

  toggleMenu(who, noDrawer?) {
    if (noDrawer) {
      // console.log('TGG 1');
      if (this.openMenu) this.drawer.close();
      this.selected[this.menu] = false;
      this.selected[who.title] = true;
      this.menu = who.title;
    } else {
      // console.log('TGG 3');
      if (this.menu === who.title) {
        if (this.openMenu) this.drawer.close();
        else this.drawer.open();
      } else {
        this.selected[this.menu] = false;
        this.selected[who.title] = true;
        this.menu = who.title;
        if (!this.openMenu) this.drawer.open();
        else if (this.openMenu && this.mobileQuery) {
          // Si está abierto y estamos en Mobile -> No hacemos nada, solo cambiamos el contenido!
        }
      }
    }
    this.sideNavBlocks = who.menu; // Para saber que enlaces hay que pintar!!!
  }

  clickedMenu(e) {
    if (this.mobileQuery && this.openMenu) this.drawer.close();
  }

  controlModalEmbedComponent(active: any): void {
    this.modalActiveEmbed = active;
  }

  openSearchDialog() {
    const title = 'Búsqueda de usuarios';
    this.dialog.open(SearchModalComponent, { data: { title: title }, autoFocus: false });
  }

  logout() {
    this.userService.logOut();
    this.router.navigate([this.logOutUrl]);
  }

  setShowAdminMenu() {
    this.adminMenu.forEach(e => { if (this.permissions[e]) this.showAdminMenu = true; });
  }

  checkModules(companyInfo) {
    const plan = companyInfo.subscriptions.type;
    const def = companyInfo.modules.default;
    if (plan !== 'basic') {
      def.map(m => this.talentooModules[m.name] = m.standard);
      const extra = companyInfo.modules.extra;
      extra.map(m => this.talentooModules[m.name] = m.active);
    } else {
      def.map(m => this.talentooModules[m.name] = m.basic);
    }
  }

  setShowControlPanelMenu() {
    this.controlPanel = this.permissionsMap.get('surveys') && this.services.surveys;
  }

  toggleChatBot(i) {
    this.chatBotHidden[i] = !this.chatBotHidden[i];
    this.chatBotHidden.forEach((bot, index) => {
      if (index !== i) this.chatBotHidden[index] = true;
    });
  }

  toggleChatBotResponsive(bot?) {
    if (this.botList.length === 1) {
      this.toggleChatBot(0);
    } else if (this.botList.length >= 2) {
      this.toggleChatBot(bot.pos);
    }
  }

  prepareBots() {
    this.environment.company.bots.map((bot, index) => {
      this.chatBotHidden.push(true);
      bot.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(bot.url);
      bot['pos'] = index;
      if (bot.active) this.botList.push(bot);
    });
  }

  onSpeedDialFabClicked(event) {
    console.log(event);
  }
  checkPendingSurveys() {
    if (this.services.surveys) {
      this.apiService.getPendingSurveys(true).subscribe((surveys: Surveys) => {
        const pendingSurveys = surveys.pendingSurveys.length;
        if (pendingSurveys > 0) {
          this.dialog.open(SurveyModalComponent, {
            panelClass: 'responsive-width-dialog',
            data: { surveys: surveys.pendingSurveys }
          });
        }
      });
    }
  }
}
