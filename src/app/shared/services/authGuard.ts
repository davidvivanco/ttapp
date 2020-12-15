import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { MatDialog } from '@angular/material';
import { Permissions } from '../models/permissions.model';
import { EventService } from './event.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private apiService: ApiService, private userService: UserService, private dialogRef: MatDialog,
        public eventService: EventService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.getToken()) {
            // authorised so return true
            this.dialogRef.closeAll();
            this.apiService.extraPersonalDataCreated().subscribe(res => {
                if (res && !this.checkPermissions(state.url, this.userService.getPermissions())) {
                    this.router.navigate(['/home']);
                } else if (res && this.checkPermissions(state.url, this.userService.getPermissions())) {
                    let json = {};
                    json['active'] = true;
                    json['modalActive'] = 'dataExtraActivated';
                    this.eventService.sendNotificationModalEmbed(json);
                }
            });

            return true;
        } else {

            // not logged in so redirect to login page with the return url
            let options: any = { queryParams: {} };
            if (state.url && state.url !== '/') {
                options.queryParams = {
                    returnUrl: state.url
                };
                if (route.routeConfig.path === 'cuadro-mandos') {
                    options.queryParams.returnUrl = route.routeConfig.path;
                    options.queryParams.survey = route.queryParams.survey;
                }
                if (route.routeConfig.path === 'academy') {
                    options.queryParams.returnUrl = route.routeConfig.path;
                    options.queryParams.urlIframe = route.queryParams.urlIframe;
                }
                if (route.routeConfig.path === 'observatory') {
                    options.queryParams.returnUrl = route.routeConfig.path;
                    options.queryParams.urlIframe = route.queryParams.urlIframe;
                }
            }
            this.router.navigate(['public/login'], options);
            return false;
        }
    }

    checkPermissions(url: string, perm: Permissions) {
        const urlPermissions = [
            {
                path: '/admin/edit-home',
                permissions: ['editar_config_superadmin']
            },
            {
                path: '/admin/edit-home-preview',
                permissions: ['editar_config_superadmin']
            },
            {
                path: '/admin/roles',
                permissions: ['actualizar_rol']
            },
            {
                path: '/admin/usuarios',
                permissions: ['actualizar_employees']
            },
            {
                path: '/admin/fichas-de-puesto',
                permissions: ['buscar_todos_card_position']
            },
            {
                path: '/admin/posiciones',
                permissions: ['buscar_todos_position']
            },
            {
                path: '/admin/competencias',
                permissions: ['buscar_todos_competences']
            },
            {
                path: '/admin/unities',
                permissions: ['buscar_todos_unity']
            },
            {
                path: '/curriculum/admin/blocks',
                permissions: ['actualizar_curriculums']
            },
            {
                path: '/admin/informacion',
                permissions: ['editar_config_superadmin']
            },
            {
                path: '/admin/config',
                permissions: ['editar_config_superadmin']
            },
            {
                path: '/admin/documentacion-api',
                permissions: ['editar_config_superadmin']
            },
            {
                path: '/seleccion/admin/convocatorias',
                permissions: ['admin']
            },
            {
                path: '/seleccion/admin/ofertas',
                permissions: ['admin']
            },
            {
                path: '/admin/cuestionarios',
                permissions: ['admin']
            },
            {
                path: '/fichajes/admin/fichajes-empresa',
                permissions: ['admin']
            },
            {
                path: '/passwordmanager/admin',
                permissions: ['admin']
            }
        ];

        let truePerm = [];
        for (const [key, value] of Object.entries(perm)) {
            if (value) {
                truePerm.push(key);
            }
        }

        let neededPerms = urlPermissions.find(u => u.path === url);
        let hasPerm = true;

        if (neededPerms && neededPerms.permissions) {
            for (const valor of neededPerms.permissions) {
                if (!truePerm.find(e => e === valor)) {
                    hasPerm = false;
                }
            }
        }

        return hasPerm;
    }
}
