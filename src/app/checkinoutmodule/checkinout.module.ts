import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// MATERIAL IMPORTS
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatSortModule
} from '@angular/material';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { CheckInOutRoutingModule } from './checkinout-routing.module';
import { CheckinoutApiService } from './services/checkinout.api.services';
import { CheckinoutComponent } from './pages/checkinout/checkinout.component';
import { SeeCheckInOutModalComponent } from './components/modals/seeCheckInOut-modal.component';
import { ManageCheckInOutComponent } from './pages/manage-check-in-out/manage-check-in-out.component';
import { ManageCheckInOutCompanyComponent } from './pages/manage-check-in-out-company/manage-check-in-out-company.component';
import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`,
    '?block=manageCheckInOutCompany&block=manageCheckInOut&block=checkInOut&folder=main');
}



@NgModule({
  declarations: [
    CheckinoutComponent,
    ManageCheckInOutComponent,
    ManageCheckInOutCompanyComponent,
    // CheckInOutModalComponent,
    SeeCheckInOutModalComponent,
  ],
  imports: [
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
    CheckInOutRoutingModule,
    CommonModule,
    FormsModule,
    // MATERIAL
    MatSortModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule, // MODALES
    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatBadgeModule,
    MatAutocompleteModule,
    MatTreeModule,
    TreeListModule,
    AvatarModule,
    BreadcrumbModule
  ],
  exports: [
  ],
  entryComponents: [
    SeeCheckInOutModalComponent,
  ],
  providers: [
    CheckinoutApiService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CheckInOutModule {
  static forRoot(): any[] | import('@angular/core').Type<any> | import('@angular/core').ModuleWithProviders<{}> {
    throw new Error('Method not implemented.');
  }
}
