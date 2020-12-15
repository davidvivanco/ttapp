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

import { CurriculumApiService } from './services/curriculum.api.service';
import { AppRoutingModule } from './app-routing.module';
import { SelectFieldComponent } from './components/select-field/select-field.component';
import { OptionsFieldComponent } from './components/options-field/options-field.component';
import { DecisionTreeFieldComponent } from './components/decision-tree-field/decision-tree-field.component';
import { UserCurriculumComponent } from './pages/user-curriculum/user-curriculum.component';
import { AddComponentModalComponent } from './pages/user-curriculum/add-component-modal/add-component-modal.component';
import { DateRangeComponent } from './components/date-range/date-range.component';
import { DecisionTreeInputComponent } from './components/decision-tree-input/decision-tree-input.component';
import { NestedMenuComponent } from './components/nested-menu/nested-menu.component';
import { EditCurriculumComponent } from './pages/edit-curriculum/edit-curriculum.component';
import { BlockCardComponent } from './components/block-card/block-card.component';
import { CommonModule } from '../common/common.module';
import { BlockComponent } from './components/block/block.component';
import { FieldModalComponent } from './components/field-modal/field-modal.component';
import { EditBlockComponent } from './pages/edit-block/edit-block.component';
import { FileUploadModule } from 'ng2-file-upload';
import { AppDateAdapter } from '../shared/formatters/format-datepicker';
import { Platform } from '@angular/cdk/platform';
import { BlocksTableComponent } from './pages/user-curriculum/blocks-table/blocks-table.component';
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
    EditCurriculumComponent,
    BlockCardComponent,
    SelectFieldComponent,
    OptionsFieldComponent,
    DecisionTreeFieldComponent,
    UserCurriculumComponent,
    DateRangeComponent,
    DecisionTreeInputComponent,
    NestedMenuComponent,
    BlockComponent,
    FieldModalComponent,
    EditBlockComponent,
    AddComponentModalComponent,
    BlocksTableComponent,
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
    EditCurriculumComponent,
    FieldModalComponent,
    AddComponentModalComponent
  ],
  providers: [
    CurriculumApiService,
    { provide: DateAdapter, useClass: AppDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    // { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
  exports: [
    BlockCardComponent,
    SelectFieldComponent,
    DecisionTreeFieldComponent
  ]
})
export class CurriculumModule { }
