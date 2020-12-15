import { Injectable, Output, EventEmitter } from '@angular/core';
import { Employee } from '../models/employee.model';
import { Permissions } from '../models/permissions.model';


@Injectable({ providedIn: 'root' })
export class UserService {

  @Output() userLoggedIn = new EventEmitter<boolean>();
  constructor() {
    
  }

  private token: string;
  private user;
  private permissionsArr = [
    'admin',
    'crear_rol',
    'eliminar_rol',
    'actualizar_rol',
    'actualizar_permiso',
    'eliminar_permiso',
    'crear_permiso',
    'eliminar_personal_data',
    'actualizar_personal_data',
    'buscar_todos_employees',
    'crear_employees',
    'actualizar_employees',
    'eliminar_employees',
    'manager',
    'buscar_todos_rol',
    'buscar_todos_permiso',
    'buscar_todos_personal_data',
    'buscar_todos_card_position',
    'crear_card_position',
    'actualizar_card_position',
    'eliminar_card_position',
    'buscar_todos_competences',
    'buscar_todos_fichajes',
    'crear_competences',
    'actualizar_competences',
    'eliminar_competences',
    'buscar_todos_curriculums',
    'crear_curriculums',
    'actualizar_curriculums',
    'eliminar_curriculums',
    'buscar_todos_position',
    'crear_position',
    'actualizar_position',
    'eliminar_position',
    'añadir_campos_extra_personal_data',
    'buscar_todos_companies',
    'crear_companies',
    'actualizar_companies',
    'eliminar_companies',
    'buscar_todos_positionHistory',
    'crear_positionHistory',
    'actualizar_positionHistory',
    'eliminar_positionHistory',
    'upsert_masivo_employees',
    'editar_config_superadmin',
    'surveys',
    'show_profiledata',
    'show_cardposition',
    'show_orgchart',
    'show_cv',
    'show_checkinout',
    'show_surveys',
    'show_password_manager',
    'show_account',
    'show_offergroups',
    'show_offers',
    'show_applications',
    'show_mobility',
    'show_academy_kolete',
    'show_education_ics',
    'show_search_employee',
    'assess_all',
    'buscar_todos_unity',
    'crear_unity',
    'actualizar_unity',
    'eliminar_unity',
  ];
  private permissions: Permissions;

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', this.token);
    if (this.token) this.userLoggedIn.emit(true);
  }

  getToken() {
    return localStorage.getItem('token');

  }

  setUser(user) {
    this.user = new Employee(user);
    localStorage.setItem('user', JSON.stringify(this.user));

  }

  getUser() {
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user;
    }
  }

  hasPermissions(): Permissions {
    this.permissions = {};
    this.user.roles.map(rol => {
      rol.permissions.map(perm => {
        this.permissions[perm.name] = this.permissionsArr.includes(perm.name);
      });
    });
    return this.permissions;
  }

  getPermissions(): Permissions {
    if (!this.permissions) {
      this.permissions = this.hasPermissions();
    }
    return this.permissions;
  }


  logOut() {
    this.user = null;
    this.permissions = null;
    this.token = '';
    localStorage.clear();
    this.userLoggedIn.emit(false);
  }

  changeTemplate(company) {
    const value = `:root {
      --primary-color: ${company.primaryColor};
      --secondary-color: ${company.secondaryColor};
    }
    .primary-color {
      color: var(--primary-color) !important;
    }

    .bg-primary-color {
      background-color: var(--primary-color) !important;
    }

    .secondary-color {
      color: var(--secondary-color) !important;
    }

    .bg-secondary-color {
      background-color: var(--secondary-color) !important;
    }

    /* LOGIN PAGE */
    .login-page {
      background-color: var(--primary-color) !important;
    }

    /* GLOBAL */
    a {
      color: var(--primary-color) !important;
    }

    /* MATERIAL COMPONENTS */
    .toast-notification {
      color: var(--primary-color) !important;
    }

    .custom-toolTip {
      background-color: var(--primary-color) !important;
    }

    /* FORMS */
    .mat-input-element, textarea.mat-input-element {
      caret-color: var(--primary-color) !important;
    }

    .mat-form-field.mat-focused .mat-form-field-underline,
    .mat-form-field-appearance-legacy.mat-focused .mat-form-field-underline,
    .mat-form-field.mat-focused .mat-form-field-underline .mat-form-field-ripple,
    .mat-form-field-appearance-legacy.mat-focused .mat-form-field-underline .mat-form-field-ripple {
      background-color: var(--primary-color) !important;
    }

    .mat-form-field-suffix .mat-icon, .mat-form-field-prefix .mat-icon {
      color: var(--primary-color) !important;
    }

    .mat-form-field-label {
      color: var(--primary-color) !important;
    }

    .mat-form-field.mat-focused .mat-form-field-label, .mat-form-field-appearance-legacy.mat-focused .mat-form-field-label {
      color: var(--primary-color) !important;
    }

    .mat-form-field.mat-focused.mat-primary .mat-select-arrow {
      color: var(--primary-color) !important;
    }

    .mat-primary .mat-option.mat-selected:not(.mat-option-disabled) {
      color: var(--primary-color) !important;
      font-weight: bold;
    }

    .mat-checkbox-indeterminate .mat-checkbox-background, .mat-checkbox-checked .mat-checkbox-background {
      background-color: var(--secondary-color) !important;
    }

    .mat-checkbox:not(.mat-checkbox-disabled).mat-accent .mat-checkbox-ripple .mat-ripple-element {
      background-color: var(--secondary-color) !important;
    }

    .mat-checkbox-inner-container:hover {
    }

    .mat-checkbox-inner-container:hover .mat-checkbox-persistent-ripple {
      opacity: 0 !important;
    }

    .mat-form-field-empty.mat-form-field-label {
      color: var(--primary-color) !important;
    }

    .mat-form-field-can-float.mat-form-field-should-float .mat-form-field-label {
      opacity: 0.48;
      color: var(--primary-color) !important;
    }

    /* END FORMS */

    .loading-table, .loading-data {
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 2;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.12);
      left: 0;
      top: 0;
    }

    /* CARDS */
    .mat-card.card-dark-header .mat-card-header {
      background-color: var(--primary-color) !important;
      color: white;
    }

    .mat-accordion.dark-header .mat-expansion-panel-header,
    .mat-accordion.dark-header .mat-expansion-panel-header:hover,
    .mat-accordion.dark-header .mat-expansion-panel-header:focus {
      background-color: var(--primary-color) !important;
    }

    /* NAV */
    .mat-nav-list .mat-list-item, .mat-nav-list .mat-list-item .mat-icon {
      color: var(--primary-color) !important;
    }

    /* END MATERIAL COMPONENTS */

    /* BUTTONS */
    .btn-primary, .btn-primary-comp, .btn-primary.fake-button {
      background-color: var(--primary-color) !important;
      color: white !important;
    }

    .btn-secondary, .btn-secondary.fake-button {
      background-color: var(--secondary-color) !important;
      color: white !important;
    }

    .btn-stroked-primary, .mat-stroked-button.mat-primary, .btn-stroked-primary.mat-stroked-button.mat-primary, .btn-stroked-primary.mat-stroked-button,
    .btn-stroked-primary.fake-button, .mat-stroked-button.mat-primary.fake-button, .btn-stroked-primary.mat-stroked-button.mat-primary.fake-button, .btn-stroked-primary.mat-stroked-button.fake-button {
      border: 1px solid var(--primary-color) !important;
      box-sizing: border-box !important;
      color: var(--primary-color) !important;
    }

    .btn-stroked-secondary, .mat-stroked-button.mat-secondary, .btn-stroked-secondary.mat-stroked-button.mat-secondary, .btn-stroked-secondary.mat-stroked-button,
    .btn-stroked-secondary, .mat-stroked-button.mat-secondary.fake-button, .btn-stroked-secondary.mat-stroked-button.mat-secondary.fake-button, .btn-stroked-secondary.mat-stroked-button.fake-button {
      border: 1px solid var(--secondary-color) !important;
      box-sizing: border-box !important;
      color: var(--secondary-color) !important;
    }
    .btn-stroked-primary:disabled, .fake-button:disabled, .mat-flat-button:disabled, .mat-primary.mat-flat-button:disabled, .mat-primary:disabled, .btn-stroked-secondary:disabled, .mat-secondary:disabled, .mat-secondary.mat-flat-button:disabled {
      border: 1px solid transparent !important;
      color: #555555 !important;
    }

    .close-dialog .mat-button, .close-dialog .mat-button .mat-button-wrapper, .close-dialog .mat-button .material-icons {
      color: #333F48 !important;
      color: var(--primary-color) !important;
    }

    .mat-icon-sm {
      font-size: 18px;
      width: 18px !important;
      height: 18px !important;
      position: relative;
      top: -1px;
    }

    .mat-icon-xs {
      font-size: 12px;
      width: 12px !important;
      height: 12px !important;
      position: relative;
      top: -1px;
    }

    .mat-icon-sm.with-text {
      font-size: 18px;
      width: 18px !important;
      height: 18px !important;
      position: relative;
      top: 4px;
      margin-right: -5px;
    }

    /* CUSTOM COMPONENTS */
    .sidenav.main-menu {
      background-color: var(--primary-color);
    }

    .menu-title h2 {
      color: var(--primary-color) !important;
    }

    .personal-data .mat-icon {
      color: var(--primary-color) !important;
    }

    .mat-dialog-container, .mat-dialog-title, .mat-dialog-title.primary-color {
      color: var(--primary-color) !important;
    }

    .login-page {
      background: linear-gradient(170deg, var(--primary-color) 0%, var(--primary-color) 100%) !important;
    }

    .mat-slide-toggle.mat-checked:not(.mat-disabled) .mat-slide-toggle-bar, .mat-slide-toggle .mat-slide-toggle-bar {
      background-color: rgba(0,0,0,0);
    }

    .mat-card .mat-slide-toggle.mat-checked:not(.mat-disabled) .mat-slide-toggle-bar, .mat-slide-toggle .mat-slide-toggle-bar {
      background-color: rgba(0,0,0,0.12);
    }

    .mat-slide-toggle.mat-checked:not(.mat-disabled) .mat-slide-toggle-thumb {
      background-color: var(--secondary-color) !important;
    }
    .mat-slide-toggle .mat-slide-toggle-ripple {
      display: none !important;
    }
    .mat-slide-toggle.mat-checked:not(.mat-disabled) .mat-slide-toggle-bar, .mat-slide-toggle .mat-slide-toggle-bar {
      background-color: rgba(0, 0, 0,0.12) !important;
    }
    .mat-radio-button.mat-accent .mat-radio-inner-circle, .mat-radio-button.mat-accent .mat-radio-ripple .mat-ripple-element:not(.mat-radio-persistent-ripple), .mat-radio-button.mat-accent.mat-radio-checked .mat-radio-persistent-ripple, .mat-radio-button.mat-accent:active .mat-radio-persistent-ripple {
      background-color: var(--secondary-color) !important;
    }
    .mat-radio-button.mat-accent.mat-radio-checked .mat-radio-outer-circle {
      border-color: var(--secondary-color) !important;
    }
    .mat-card.blank-header .mat-card-header .mat-card-header-text .mat-card-title {
      color: var(--primary-color);
    }
    .mat-card.blank-header .mat-card-header .mat-card-header-text .mat-card-subtitle {
      color: var(--primary-color);
    }
    .mat-card.blank-header .mat-card-header .mat-icon {
      color: var(--primary-color);
      fill: var(--primary-color);
    }
    .toast-notification {
      background: white !important;
      border: 1px solid var(--primary-color) !important;
      color: var(--primary-color) !important;
    }
    .sidenav.main-menu button.selected {
      background-color: #fff !important;
      color: var(--primary-color) !important;
      border-radius: 0px !important;
    }
    .sidenav.main-menu button.selected .mat-icon {color: var(--primary-color) !important;}
    `;
    return value;
  }
}
