import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatInputModule,
  MatSelectModule,
  MatMenuModule,
  MatDatepickerModule,
  MatButtonToggleModule,
  MatChipsModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatDialogModule,
  MatProgressBarModule,
  MatPaginatorModule,
  MatTableModule,
  DateAdapter,
  MatExpansionModule,
  MAT_DATE_LOCALE,
} from '@angular/material';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { AdminPersonalDataApiService } from './services/admin-personal-data.api.service';
import { AppRoutingModule } from './app-routing.module';

import { CommonModule } from '../common/common.module';

import { FileUploadModule } from 'ng2-file-upload';

import { Platform } from '@angular/cdk/platform';

import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppDateAdapter } from 'src/app/shared/formatters/format-datepicker';
import { AdminPersonalDataComponent } from './pages/admin-personal-data/admin-personal-data.component';
import { AddFieldModalComponent } from './pages/admin-personal-data/modal/add-field-modal/add-field-modal.component';
import { DeleteModalComponent } from './pages/admin-personal-data/modal/delete-modal/delete-modal.component';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`,
      '?block=manageCheckInOutCompany&block=manageCheckInOut&block=checkInOut&folder=main');
}

@NgModule({
  declarations: [
    AdminPersonalDataComponent,
    AddFieldModalComponent,
    DeleteModalComponent
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
    CommonModule,
    MatMomentDateModule,
    MatMenuModule,
    MatDatepickerModule,
    MatExpansionModule,
    DragDropModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FileUploadModule,
    AvatarModule,
    BreadcrumbModule
  ],
  entryComponents: [
    AddFieldModalComponent,
    DeleteModalComponent
  ],
  providers: [
    AdminPersonalDataApiService,
    { provide: DateAdapter, useClass: AppDateAdapter, deps: [MAT_DATE_LOCALE, Platform]},
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    // { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
  exports: [
  ]
})
export class AdminPersonalDataModule { }
