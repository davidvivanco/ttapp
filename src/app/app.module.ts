import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonFunctions } from './commonFunctions';

// COMMON
import { NotFoundComponent } from './shared/components/shared/not-found/not-found.component';
import { SideNavComponent } from './core/side-nav/side-nav.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { NotificationsComponent } from './core/notifications/notifications.component';
// PAGES
import { MainPageComponent } from './main-page/main-page.component';
import { HomeComponent } from './home/home.component';
import { DocumentationComponent } from './documentation-api/documentation.component';



// MATERIAL IMPORTS
import {
  DateAdapter,
  MAT_DATE_LOCALE,
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
  MatPaginatorIntl,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatSlideToggleModule,
  MatSortModule, MatProgressBarModule,
  MatRadioModule,
  MAT_DIALOG_DATA,
  MatBottomSheetModule,
  MatGridListModule
} from '@angular/material';

import { AppDateAdapter } from 'src/app/shared/formatters/format-datepicker';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Platform } from '@angular/cdk/platform';

import { getSpanishPaginatorIntl } from './shared/i18n/spanish-paginator-intl';

import { PersonalDataComponent } from './personal-data/personal-data.component';
import { CardPositionComponent } from './card-position/card-position.component';
import { AdminPositionCardsComponent } from './admin/admin-position-cards/admin-position-cards.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchModalComponent } from './search/search-modal/search-modal.component';
import { SearchModalUnitiesComponent } from './search/search-modal-unities/search-modal-unities.component';
import { SearchModalPositionCardsComponent } from './search/search-modal-position-cards/search-modal-position-cards.component';
import { SearchModalRolesComponent } from './search/search-modal-roles/search-modal-roles.component';
import { SearchModalOrgChartComponent } from './search/search-modal-org-chart/search-modal-org-chart.component';
import { AuthInterceptor } from './shared/services/authInterceptor';
import { EventService } from './shared/services/event.service';
import { ErrorMessagesComponent } from './shared/components/shared/error-messages/error-messages.component';
import { AvatarModule } from './shared/modules/avatar/avatarmodule.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UploadAvatarModalComponent } from './shared/components/shared/modals/upload-avatar-modal/upload-avatar-modal.component';
import { UploadImageCompanyModalComponent } from './superadmin/configuration/upload-image-company-modal/upload-image-company-modal.component';
import { DeleteConfirmationModalComponent } from './shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { NgOrganizationChartNodeComponent } from './shared/components/ng-organization-chart/ng-organization-chart-node/ng-organization-chart-node.component';
import { NgOrganizationChartListComponent } from './shared/components/ng-organization-chart/ng-organization-chart-list/ng-organization-chart-list.component';
import { NgOrganizationChartComponent } from './shared/components/ng-organization-chart/ng-organization-chart.component';
import { NgOrganizationManagerChartNodeComponent } from './shared/components/ng-organization-manager-chart/ng-organization-manager-chart-node/ng-organization-manager-chart-node.component';
import { NgOrganizationManagerChartListComponent } from './shared/components/ng-organization-manager-chart/ng-organization-manager-chart-list/ng-organization-manager-chart-list.component';
import { NgOrganizationManagerChartComponent } from './shared/components/ng-organization-manager-chart/ng-organization-manager-chart.component';
import { PositionChartComponent } from './card-position-chart/position-chart.component';
import { PositionManagerChartComponent } from './card-position-manager-chart/position-manager-chart.component';
import { AccountComponent } from './account/account.component';
import { ConfigurationModule } from './configuration/configuration.module';
import { AdminPositionCardsModalComponent } from './admin/admin-position-cards/modal/admin-position-cards-modal.component';
import { UsersComponent } from './admin/users/users.component';
import { AssignRolModalComponent } from './admin/users/assign-rol-modal/assign-rol-modal.component';
import { SearchEmployeeModalComponent } from './admin/users/search-employee-modal/search-employee-modal.component';
import { UploadTemplateModalComponent } from './admin/users/upload-template-modal/upload-template-modal.component';
import { RolesComponent } from './admin/roles/roles.component';
import { CompetencyComponent } from './admin/competency/competency.component';
import { CompetencyModalComponent } from './admin/competency/competency-modal/competency-modal.component';
import { PositionsComponent } from './admin/positions/positions.component';
import { PositionsModalComponent } from './admin/positions/positions-modal/positions-modal.component';
import { UnitiesComponent } from './admin/unities/pages/unities/unities.component';
import { UnitiesFormComponent } from './admin/unities/pages/unities-form/unities-form.component';
import { UnitiesModalComponent } from './admin/unities/components/modals/unities-modal/unities-modal.component';
import { UsersUnityModalComponent } from './admin/unities/components/modals/users-modal/users-modal.component';
import { RolModalComponent } from './admin/roles/rol-modal/rol-modal.component';
import { PersonalManagerDataModalComponent } from './card-position-manager-chart/personal-data-modal/personal-data-modal.component';
import { PersonalDataModalComponent } from './personal-data/personal-data-modal/personal-data-modal.component';
import { CardPositionModalComponent } from './card-position/card-position-modal/card-position-modal.component';
import { MyTeamComponent } from './my-team/my-team.component';
import { NotificationsListComponent } from './core/notifications/notifications-list/notifications-list.component';
import { CheckInOutModalComponent } from './shared/components/shared/modals/checkinout-modal/checkInOut-modal.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { SharedModule } from './shared/services/shared-services/shared-services.module';
import { FileUploadModule } from 'ng2-file-upload';
import { UserInfoComponent } from './admin/users/user-info/user-info.component';
import { UsersModalComponent } from './admin/users/users-modal/users-modal.component';
import { UserInfoModalComponent } from './admin/users/user-info/user-info-modal/user-info-modal.component';
import { AssignManagersModalComponent } from './admin/users/user-info/assign-managers-modal/assign-managers-modal.component';
import { ChangesConfirmationModalComponent } from './shared/components/shared/modals/changes-confirmation-modal/changes-confirmation-modal.component';
import { TranslationService } from './shared/services/translation.service';
import { environment } from '../environments/environment';
import { CustomValidators } from './shared/validators/custom-validators';
import { CompanyComponent } from './superadmin/company/company.component';
import { ConfigurationComponent } from './superadmin/configuration/configuration.component';
import { CompanyModalComponent } from './superadmin/company/company-modal/company-modal.component';
import { UnsubscribeCompanyModalComponent } from './superadmin/company/unsubscribe-company-modal/unsubscribe-company-modal.component';
import { EndSignInComponent } from './end-sign-in/end-sign-in.component';


import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { SurveyModalComponent } from './shared/components/shared/modals/survey-modal/survey-modal.component';
import { TypeFormService } from './shared/services/typeForm.service';
import { QuestsComponent } from './quests/quests.component';
import { PendingSurveysComponent } from './shared/components/pending-surveys/pending-surveys.component';
import { EditHomeComponent } from './superadmin/home-editable/edit-home/edit-home.component';
import { PreviewComponent } from './superadmin/home-editable/preview/preview.component';
import { UploadImageHomeModalComponent } from './superadmin/home-editable/edit-home/upload-image-home-modal/upload-image-home-modal.component';
import { AuditsComponent } from './superadmin/audits/audits.component';
import { AuditsModalComponent } from './superadmin/audits/audits-modal/audits-modal.component';
import { MultipleFilesUploaderComponent } from './multiple-files-uploader/multiple-files-uploader.component';
import { MenuComponent } from './superadmin/menu/menu.component';
import { MenuModalComponent } from './superadmin/menu/menu-modal/menu-modal.component';
import { DeleteModalComponent } from './superadmin/menu/delete-modal/delete-modal.component';
import { UrlModalComponent } from './superadmin/menu/url-modal/url-modal.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BreadcrumbModule } from './shared/modules/breadcrumb/breadcrumbmodule.module';
import { ModalEmbedComponent } from './modal-embed/modal-embed.component';
import { CustomSurveyModalComponent } from './shared/components/shared/modals/custom-survey-modal/custom-survey-modal.component';
import { SubMenuComponent } from './superadmin/menu/sub-menu/sub-menu.component';
import { DndModule } from 'ngx-drag-drop';
import { AppMediaContentComponent } from './app-media-content/app-media-content.component';
import { InfoModalComponent } from './shared/components/shared/modals/info-modal/info-modal.component';
import { MediaManagerComponent } from './media-manager/media-manager.component';
import { InfoOrgModalComponent } from './shared/components/ng-organization-chart/ng-organization-chart-node/modal/info-org-modal/info-org-modal.component';



import { AngularEditorModule } from '@kolkov/angular-editor';
import { EscapeHtmlPipe } from './keep-html.pipe';
import { LinksComponent } from './core/side-nav/links/links.component';
import { BottomMenuComponent } from './main-page/bottom-menu/bottom-menu.component';
import { ViewModalComponent } from './media-manager/view-modal/view-modal.component';
import { SpeedDialFabComponent } from './main-page/speed-dial-fab/speed-dial-fab.component';
import { VersionsComponent } from './versions/versions.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`, '?block=personalDataMenu&folder=sideNav');
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    SideNavComponent,
    HeaderComponent,
    NotificationsComponent,
    FooterComponent,
    HomeComponent,
    MainPageComponent,
    PersonalDataComponent,
    PositionChartComponent,
    PositionManagerChartComponent,
    CardPositionComponent,
    AdminPositionCardsComponent,
    SearchResultsComponent,
    SearchModalComponent,
    SearchModalUnitiesComponent,
    SearchModalPositionCardsComponent,
    SearchModalRolesComponent,
    SearchModalOrgChartComponent,
    DeleteConfirmationModalComponent,
    ChangesConfirmationModalComponent,
    AdminPositionCardsModalComponent,
    ErrorMessagesComponent,
    UploadAvatarModalComponent,
    UploadImageCompanyModalComponent,
    NgOrganizationChartComponent,
    NgOrganizationChartListComponent,
    NgOrganizationChartNodeComponent,
    NgOrganizationManagerChartComponent,
    NgOrganizationManagerChartListComponent,
    NgOrganizationManagerChartNodeComponent,
    UsersComponent,
    AssignRolModalComponent,
    SearchEmployeeModalComponent,
    RolesComponent,
    RolModalComponent,
    PersonalDataModalComponent,
    CardPositionModalComponent,
    CompetencyComponent,
    CompetencyModalComponent,
    PositionsComponent,
    PositionsModalComponent,
    SurveyModalComponent,
    CustomSurveyModalComponent,
    MyTeamComponent,
    NotificationsListComponent,
    CheckInOutModalComponent,
    UploadTemplateModalComponent,
    UserInfoComponent,
    UsersModalComponent,
    PersonalManagerDataModalComponent,
    UserInfoModalComponent,
    AssignManagersModalComponent,
    ChangesConfirmationModalComponent,
    AccountComponent,
    CompanyComponent,
    CompanyModalComponent,
    UnsubscribeCompanyModalComponent,
    ConfigurationComponent,
    DocumentationComponent,
    QuestsComponent,
    PendingSurveysComponent,
    EditHomeComponent,
    PreviewComponent,
    UploadImageHomeModalComponent,
    EndSignInComponent,
    AuditsComponent,
    AuditsModalComponent,
    MultipleFilesUploaderComponent,
    ModalEmbedComponent,
    MenuComponent,
    MenuModalComponent,
    DeleteModalComponent,
    UrlModalComponent,
    SubMenuComponent,
    AppMediaContentComponent,
    InfoModalComponent,
    EscapeHtmlPipe,
    UnitiesComponent,
    UnitiesFormComponent,
    UnitiesModalComponent,
    UsersUnityModalComponent,
    LinksComponent,
    BottomMenuComponent,
    MediaManagerComponent,
    InfoOrgModalComponent,
    ViewModalComponent,
    SpeedDialFabComponent,
    VersionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AvatarModule,
    SharedModule.forRoot(),
    ImageCropperModule,
    // MATERIAL
    MatSortModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule, // MODALES
    MatSnackBarModule,
    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatBottomSheetModule,
    ConfigurationModule,
    GridModule,
    TreeListModule,
    FileUploadModule,
    MatProgressBarModule,
    ColorPickerModule,
    DragDropModule,
    BreadcrumbModule,
    DndModule,
    AngularEditorModule,
    MatGridListModule
  ],
  exports: [
    NgOrganizationChartComponent,
    ErrorMessagesComponent
  ],
  providers: [
    CustomValidators,
    CommonFunctions,
    EventService,
    TranslationService,
    TypeFormService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    { provide: DateAdapter, useClass: AppDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
  entryComponents: [
    MainPageComponent,
    HomeComponent,
    SearchModalComponent,
    SearchModalUnitiesComponent,
    SearchModalPositionCardsComponent,
    SearchModalRolesComponent,
    SearchModalOrgChartComponent,
    SurveyModalComponent,
    CustomSurveyModalComponent,
    AdminPositionCardsModalComponent,
    DeleteConfirmationModalComponent,
    UploadAvatarModalComponent,
    UploadImageCompanyModalComponent,
    UploadImageHomeModalComponent,
    NgOrganizationChartNodeComponent,
    NgOrganizationChartListComponent,
    NgOrganizationManagerChartNodeComponent,
    NgOrganizationManagerChartListComponent,
    AssignRolModalComponent,
    SearchEmployeeModalComponent,
    RolModalComponent,
    CompetencyModalComponent,
    CheckInOutModalComponent,
    PositionsModalComponent,
    PersonalDataModalComponent,
    CardPositionModalComponent,
    UploadTemplateModalComponent,
    UsersModalComponent,
    PersonalManagerDataModalComponent,
    UserInfoModalComponent,
    AssignManagersModalComponent,
    ChangesConfirmationModalComponent,
    CompanyModalComponent,
    UnsubscribeCompanyModalComponent,
    DocumentationComponent,
    AuditsModalComponent,
    MultipleFilesUploaderComponent,
    MenuModalComponent,
    DeleteModalComponent,
    UrlModalComponent,
    InfoModalComponent,
    UnitiesModalComponent,
    UsersUnityModalComponent,
    BottomMenuComponent,
    InfoOrgModalComponent,
    ViewModalComponent
  ],

  bootstrap: [AppComponent]
})

export class AppModule { }
