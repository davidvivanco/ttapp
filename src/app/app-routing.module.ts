import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuicklinkStrategy, QuicklinkModule } from 'ngx-quicklink';
import { NotFoundComponent } from './shared/components/shared/not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { PositionChartComponent } from './card-position-chart/position-chart.component';
import { PositionManagerChartComponent } from './card-position-manager-chart/position-manager-chart.component';
import { CardPositionComponent } from './card-position/card-position.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { AdminPositionCardsComponent } from './admin/admin-position-cards/admin-position-cards.component';
import { AuthGuard } from './shared/services/authGuard';
import { CanDeactivateGuard } from './shared/services/canDeactivate.guard';
import { UsersComponent } from './admin/users/users.component';
import { RolesComponent } from './admin/roles/roles.component';
import { CompanyComponent } from './superadmin/company/company.component';
import { ConfigurationComponent } from './superadmin/configuration/configuration.component';
import { CompetencyComponent } from './admin/competency/competency.component';
import { PositionsComponent } from './admin/positions/positions.component';
import { UnitiesComponent } from './admin/unities/pages/unities/unities.component';
import { UnitiesFormComponent } from './admin/unities/pages/unities-form/unities-form.component';
import { MyTeamComponent } from './my-team/my-team.component';
import { NotificationsListComponent } from './core/notifications/notifications-list/notifications-list.component';
import { AccountComponent } from './account/account.component';
import { DocumentationComponent } from './documentation-api/documentation.component';
import { QuestsComponent } from './quests/quests.component';
import { EditHomeComponent } from './superadmin/home-editable/edit-home/edit-home.component';
import { PreviewComponent } from './superadmin/home-editable/preview/preview.component';
import { EndSignInComponent } from './end-sign-in/end-sign-in.component';
import { AuditsComponent } from './superadmin/audits/audits.component';
import { MenuComponent } from './superadmin/menu/menu.component';
import { SubMenuComponent } from './superadmin/menu/sub-menu/sub-menu.component';
import { MediaManagerComponent } from './media-manager/media-manager.component';
import { VersionsComponent } from './versions/versions.component';

// CONFIG SIN RUTAS DINAMICAS
const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    // AUTHGUARD AND CANDEACTIVATEGUARD COMPONENTS
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      // USER
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'datos-personales', component: PersonalDataComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'datos-personales/:employee', component: PersonalDataComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'cuenta', component: AccountComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'cuestionarios', component: QuestsComponent, canActivate: [AuthGuard] },
      { path: 'organigrama', component: PositionChartComponent, canActivate: [AuthGuard] },
      { path: 'organigrama-manager', component: PositionManagerChartComponent, canActivate: [AuthGuard] },
      { path: 'passwordmanager', loadChildren: './password-manager/password-manager.module#PasswordManagerModule', canActivate: [AuthGuard] },
      { path: 'academy', loadChildren: './academy/academy.module#AcademyModule', canActivate: [AuthGuard] },
      { path: 'observatory', loadChildren: './observatory/observatory.module#ObservatoryModule', canActivate: [AuthGuard] },
      { path: 'organigrama/:cardPosition', component: PositionChartComponent, canActivate: [AuthGuard] },
      { path: 'ficha-de-puesto', component: CardPositionComponent, canActivate: [AuthGuard] },
      { path: 'ficha-de-puesto/:employee/:cardId', component: CardPositionComponent, canActivate: [AuthGuard] },
      { path: 'ficha-de-puesto/:employee', component: CardPositionComponent, canActivate: [AuthGuard] },
      { path: 'manager/mi-equipo', component: MyTeamComponent, canActivate: [AuthGuard] },
      { path: 'finalizacion-registro', component: EndSignInComponent, canActivate: [AuthGuard] },
      { path: 'versiones', component: VersionsComponent, canActivate: [AuthGuard] },

      // END USER
      // ADMIN
      { path: 'admin/usuarios', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'admin/roles', component: RolesComponent, canActivate: [AuthGuard] },
      { path: 'admin/fichas-de-puesto', component: AdminPositionCardsComponent, canActivate: [AuthGuard] },
      { path: 'admin/posiciones', component: PositionsComponent, canActivate: [AuthGuard] },
      { path: 'admin/competencias', component: CompetencyComponent, canActivate: [AuthGuard] },
      { path: 'admin/unities', component: UnitiesComponent, canActivate: [AuthGuard] },
      { path: 'admin/unities/add', component: UnitiesFormComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/unities/edit/:unity', component: UnitiesFormComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/unities/view/:unity', component: UnitiesFormComponent, canActivate: [AuthGuard] },
      { path: 'admin/informacion', component: CompanyComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/config', component: ConfigurationComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/edit-home', component: EditHomeComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/audits', component: AuditsComponent, canActivate: [AuthGuard] },
      { path: 'admin/crear-menu', component: MenuComponent, canActivate: [AuthGuard] },
      { path: 'admin/crear-menu/add', component: SubMenuComponent, canActivate: [AuthGuard] },
      { path: 'admin/crear-menu/edit/:id', component: SubMenuComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'admin/media-manager', component: MediaManagerComponent, canActivate: [AuthGuard] },

      // { path: 'admin/crear-menu-personalizado', component: MenuPersonalizadoComponent, canActivate: [AuthGuard] },
      { path: 'admin/edit-home-preview', component: PreviewComponent, canActivate: [AuthGuard] },
      { path: 'admin/passwordmanager', loadChildren: './password-manager/password-manager.module#PasswordManagerModule', canActivate: [AuthGuard] },
      { path: 'admin/documentacion-api', component: DocumentationComponent, canActivate: [AuthGuard] },
      { path: 'admin/cuestionarios', loadChildren: './admin-surveys/admin-surveys.module#SurveysModule', canActivate: [AuthGuard] },
      { path: 'admin/datos-personales', loadChildren: './admin-personal-data/admin-personal-data.module#AdminPersonalDataModule', canActivate: [AuthGuard] },
      // END ADMIN
      // VARIOS
      { path: 'resultados-de-busqueda', component: SearchResultsComponent, canActivate: [AuthGuard] },
      { path: 'notificaciones', component: NotificationsListComponent, canActivate: [AuthGuard] },
      { path: 'fichajes', loadChildren: './checkinoutmodule/checkinout.module#CheckInOutModule', canActivate: [AuthGuard] },
      { path: 'cuadro-mandos', loadChildren: './dashboards-module/dashboards.module#DashboardsModule', canActivate: [AuthGuard] },
      { path: 'guidelines', loadChildren: './guidelines-module/guidelines.module#GuidelinesModule', canActivate: [AuthGuard] },
      { path: 'seleccion', loadChildren: './selection-module/selection.module#SelectionModule', canActivate: [AuthGuard] },
      { path: 'curriculum', loadChildren: './curriculum/curriculum.module#CurriculumModule', canActivate: [AuthGuard] },
      { path: 'iframe/:url', loadChildren: './iframe/iframe.module#IframeModule', canActivate: [AuthGuard] },

      // END VARIOS
    ]
  },
  { path: 'public', loadChildren: './public-module/public.module#PublicModule' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    QuicklinkModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: QuicklinkStrategy,
      onSameUrlNavigation: 'ignore',
      anchorScrolling: 'enabled',
    })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
