import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './pages/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import {
  MatIconModule,
  MatSelectModule,
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatToolbarModule, MatTableModule, MatMenuModule, MatCardModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatDatepickerModule, MatRadioModule, MatSidenavModule
} from '@angular/material';
import { PublicRoutingModule } from './public-routing.module';
import { PublicApiService } from './services/public.api.service';
import { LoadingComponent } from './pages/loading/loading.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ConfigurationCompany } from '../shared/models/configuration.model';
import { JobPortalComponent } from './pages/job-portal/job-portal.component';
import { AnnouncementsComponent } from './pages/job-portal/announcements/announcements.component';
import { OffersComponent } from './pages/job-portal/offers/offers.component';
import { BreadcrumbModule } from '../shared/modules/breadcrumb/breadcrumbmodule.module';
import { createTranslateLoader } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { SelectionApiService } from '../selection-module/services/selection.api.services';
import { SearchPortalModalComponent } from './pages/job-portal/modals/search-portal-modal/search-portal-modal.component';
import { AnnouncementModalComponent } from './pages/job-portal/modals/announcement-modal/announcement-modal.component';
import { OffersListComponent } from './pages/job-portal/offers/offers-list/offers-list.component';
import { OfferModalComponent } from './pages/job-portal/modals/offer-modal/offer-modal.component';
import { AccessModalComponent } from './pages/job-portal/modals/access-modal/access-modal.component';
import { ModalRegisterComponent } from './pages/job-portal/modals/modal-register/modal-register.component';
import { ModalLoginComponent } from './pages/job-portal/modals/modal-login/modal-login.component';
import { LoginComponent, RecoveryPasswordModalComponent } from './components/login/login.component';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import {  GoogleLoginProvider, FacebookLoginProvider} from 'angularx-social-login';
import { LoginPageComponent } from './pages/login-page/login-page.component';

let config = new AuthServiceConfig([
  {
  id: GoogleLoginProvider.PROVIDER_ID,
  provider: new GoogleLoginProvider('913114775414-dpqqfbq4q0vfpb8s615cicb6h3rdk0fl.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('1619076018274365')
  }
  ]);

  export function provideConfig() {
    return config;
    }



@NgModule({
  declarations: [
    RegisterComponent,
    LoadingComponent,
    RegisterFormComponent,
    JobPortalComponent,
    AnnouncementsComponent,
    OffersComponent,
    SearchPortalModalComponent,
    AnnouncementModalComponent,
    OffersListComponent,
    OfferModalComponent,
    AccessModalComponent,
    ModalRegisterComponent,
    ModalLoginComponent,
    LoginComponent,
    RecoveryPasswordModalComponent,
    LoginPageComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PublicRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      extend: true,
      defaultLanguage: (window.sessionStorage.getItem('lang')) ?
        window.sessionStorage.getItem('lang') :
        'es'
    }),
    MatToolbarModule,
    BreadcrumbModule,
    MatTableModule,
    MatMenuModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSidenavModule,
    SocialLoginModule
  ],
  exports: [],
  entryComponents: [
    SearchPortalModalComponent,
    AnnouncementModalComponent,
    OfferModalComponent,
    AccessModalComponent,
    ModalRegisterComponent,
    ModalLoginComponent,
    RecoveryPasswordModalComponent
  ],
  providers: [
    PublicApiService,
    ConfigurationCompany,
    SelectionApiService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
      }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class PublicModule { }
