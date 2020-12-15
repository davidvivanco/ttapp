import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
// MATERIAL IMPORTS
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  // MatPaginatorIntl,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  // MatSidenavModule,
  // MatSnackBarModule,
  MatTableModule,
  // MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatSortModule,
  MatRadioModule
} from '@angular/material';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { AdminSurveysRoutingModule } from './admin-surveys-routing.module';
import { AdminSurveysApiService } from './services/admin-surveys.api.services';
import { AdminTypeformSurveysFormComponent } from './pages/admin-typeform-surveys-form/admin-typeform-surveys-form.component';
import { AdminTypeformSurveysComponent } from './pages/admin-typeform-surveys/admin-typeform-surveys.component';

import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';
// import { SharedModule } from '../shared/services/shared-services/shared-services.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TypeformSurveyModalComponent } from './components/modals/typeform/typeform-survey-modal.component';
import { AdminCustomSurveysComponent } from './pages/admin-custom-surveys/admin-custom-surveys.component';
import { AdminCustomSurveysFormComponent } from './pages/admin-custom-surveys-form/admin-custom-surveys-form.component';
import { AdminCustomSurveysBlockFormComponent } from './pages/admin-custom-surveys-block-form/admin-custom-surveys-block-form.component';
import { CustomSurveyQuestionModalComponent } from './components/modals/custom/question/question-modal.component';
import { CustomSurveyAnswerModalComponent } from './components/modals/custom/answer/answer-modal.component';
// import { MultipleFilesUploaderComponent } from '../multiple-files-uploader/multiple-files-uploader.component';
import { BreadcrumbModule } from '../shared/modules/breadcrumb/breadcrumbmodule.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`,
    "?block=manageCheckInOutCompany&block=manageCheckInOut&block=checkInOut&folder=main");
}



@NgModule({
  declarations: [
    AdminTypeformSurveysComponent,
    AdminTypeformSurveysFormComponent,
    TypeformSurveyModalComponent,
    AdminCustomSurveysComponent,
    AdminCustomSurveysFormComponent,
    AdminCustomSurveysBlockFormComponent,
    CustomSurveyQuestionModalComponent,
    CustomSurveyAnswerModalComponent
    //MultipleFilesUploaderComponent
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
    AdminSurveysRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // MATERIAL
    MatSortModule,
    MatButtonModule,
    MatCheckboxModule,
    // MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule, // MODALES
    // MatSnackBarModule,
    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    // MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatRadioModule,
    // MatSnackBarModule,
    TreeListModule,
    AvatarModule,
    DragDropModule,
    BreadcrumbModule
    // SharedModule // Ya se importa en appRoot, no hace falta hacerlo otra vez
  ],
  exports: [
  ],
  entryComponents: [
    TypeformSurveyModalComponent,
    CustomSurveyQuestionModalComponent,
    CustomSurveyAnswerModalComponent
  ],
  providers: [
    AdminSurveysApiService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SurveysModule {
  static forRoot(): any[] | import("@angular/core").Type<any> | import("@angular/core").ModuleWithProviders<{}> {
    throw new Error("Method not implemented.");
  }
}
