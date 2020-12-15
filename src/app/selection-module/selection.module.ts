import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  MatDatepickerModule,
  MatSortModule,
  MatRadioModule,
  MatSlideToggleModule
} from '@angular/material';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ListOffersComponent } from './pages/offers/list-offers/list-offers.component';
import { AddOfferComponent } from './pages/offers/add-offer/add-offer.component';

import { ListAnnouncementsComponent } from './pages/announcements/list-announcements/list-announcements.component';
import { AnnouncementsListComponent } from './components/announcements/announcements-list/announcements-list.component';
import { AddAnnouncementComponent } from './pages/announcements/add-announcement/add-announcement.component';
import { AnnouncementComponent } from './components/announcements/announcement/announcement.component';

import { SelectionRoutingModule } from './selection-routing.module';
import { SelectionApiService } from './services/selection.api.services';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { OffersListComponent } from './components/offers/offers-list/offers-list.component';
import { OfferComponent } from './components/offers/offer/offer.component';

import { AddPhaseModalComponent } from './components/offers/offer/modals/add-phase-modal/add-phase-modal.component';
import { AddDocumentationModalComponent } from './components/offers/offer/modals/add-documentation-modal/add-documentation-modal.component';
import { LinkAnnouncementModalComponent } from './components/offers/offer/modals/link-announcement-modal/link-announcement-modal.component';

import { FileUploadModule } from 'ng2-file-upload';
import { LinkOffersModalComponent } from './components/announcements/announcement/modals/link-offers-modal/link-offers-modal.component';

import { CustomDataSource } from './components/custom-data-source/custom-data-source';
import { ListRequirementsComponent } from './pages/list-requirements/list-requirements.component';
import { RequirementListComponent } from './components/requirements/requirement-list/requirement-list.component';
import { AddRequirementComponent } from './pages/add-requirement/add-requirement.component';
import { RequirementComponent } from './components/requirements/requirement/requirement.component';
import { AddRequirementCriterionComponent } from './pages/add-requirementCriterion/add-requirementCriterion.component';
import { PrivateListAnnouncementsComponent } from './pages/private-list-announcements/private-list-announcements.component';
import { PrivateAnnouncementsListComponent } from './components/private-announcements-list/private-announcements-list.component';
import { AnnouncementModalComponent } from './components/private-announcements-list/announcement-modal/announcement-modal.component';
import { OffersListAnnouncementComponent } from './components/offers-list-announcement/offers-list-announcement.component';
import { ListOffersAnnouncement } from './pages/list-offers-announcement/list-offers-announcement.component';
import { OfferModalComponent } from './components/offers-list-announcement/offer-modal/offer-modal.component';
import { NominationsComponent } from './pages/nominations/nominations.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { AdminCandidatesComponent } from './pages/admin-candidates/admin-candidates.component';



import { AdminCandidatesPersonalDataComponent } from './pages/admin-candidates/components/personal-data/admin-candidates-personal-data.component';
import { AdminCandidatesUserCurriculumComponent } from './pages/admin-candidates/components/user-curriculum/admin-candidates-user-curriculum.component';
import { CurriculumApiService } from '../curriculum/services/curriculum.api.service';
import { AdminCandidatesNominationsComponent } from './pages/admin-candidates/components/nominations/admin-candidates-nominations.component';
import { BaremarModalComponent } from './pages/admin-candidates/components/nominations/baremar-component-modal/baremar-modal.component';
import { StatusModalComponent } from './pages/admin-candidates/components/nominations/status-component-modal/status-modal.component';
import { ButtonsComponent } from './pages/admin-candidates/components/buttons/buttons.component';
import { EmployeeLabelComponent } from './pages/admin-candidates/components/employee-label/employee-label.component';
import { BlocksTableComponent } from './pages/admin-candidates/components/user-curriculum/blocks-table/blocks-table.component';
import { AddComponentModalComponent } from './pages/admin-candidates/components/user-curriculum/add-component-modal/add-component-modal.component';
import { RequirementOfferModalComponent } from './components/offers/offers-list/modals/requirement-modal/requirement-modal.component';

import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';
import { CriterionModalComponent } from './components/requirements/requirementCriteria/modals/criterion/criterion-modal.component';
import { RequirementCriteriaComponent } from './components/requirements/requirementCriteria/requirementCriteria.component';
import { ExistsComponent } from './components/formulas/exists/exists.component';
import { CombinationsModalComponent } from './components/requirements/requirementCriteria/modals/combinations/combinations-modal.component';
import { NestedMenuComponent } from './components/requirements/requirementCriteria/modals/combinations/fields/nested-menu/nested-menu.component';
import { ExistsCombinationComponent } from './components/requirements/requirementCriteria/modals/combinations/formulas/exists/exists-combination.component';
import { OptionsFieldComponent } from './components/requirements/requirementCriteria/modals/combinations/fields/options-field/options-field.component';
import { CriterionContainerComponent } from './components/requirements/criterion-container/criterion-container.component';
import { AddRequirementCriterionModalComponent } from './components/offers/offer/modals/add-requirement-criterion/add-requirement-criterion.component';
import { MAT_DATE_LOCALE } from '@angular/material';
import { AddPositionModalComponent } from './components/offers/offer/modals/add-position-modal/add-position-modal.component';
import { CheckboxTableComponent } from './components/checkbox-table/checkbox-table.component';
import { NotifyService } from '../common/services/notify.service';
import { AddVacanciesModalComponent } from './components/offers/offers-list/modals/add-vacancies-modal/add-vacancies-modal.component';
import { AddSubscriptionComponent } from './pages/subscriptions/modals/add-subscription/add-subscription.component';
import { VisibilityFilterComponent } from './components/visibility-filter/visibility-filter.component';
import { AddRequirementCriterionValorationComponent } from './pages/add-requirementCriterionValoration/add-requirement-criterion-valoration.component';
import { ConditionalComponent } from './components/requirements/conditional/conditional.component';
import { OtherMeritsComponent } from './components/requirements/modals/other-merits/other-merits.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`,
    '?block=manageCheckInOutCompany&block=manageCheckInOut&block=checkInOut&folder=main');
}



@NgModule({
  declarations: [
    ListOffersComponent,
    AddOfferComponent,
    OffersListComponent,
    OffersListAnnouncementComponent,
    OfferComponent,
    ListAnnouncementsComponent,
    PrivateListAnnouncementsComponent,
    AddAnnouncementComponent,
    AnnouncementsListComponent,
    PrivateAnnouncementsListComponent,
    AnnouncementComponent,
    AddPhaseModalComponent,
    AddDocumentationModalComponent,
    LinkAnnouncementModalComponent,
    LinkOffersModalComponent,
    ListRequirementsComponent,
    AddRequirementComponent,
    AddRequirementCriterionComponent,
    AddRequirementCriterionModalComponent,
    RequirementComponent,
    RequirementCriteriaComponent,
    ExistsCombinationComponent,
    RequirementListComponent,
    CriterionModalComponent,
    CombinationsModalComponent,
    AnnouncementModalComponent,
    OfferModalComponent,
    ListOffersAnnouncement,
    NominationsComponent,
    BlocksTableComponent,
    SubscriptionsComponent,
    AddComponentModalComponent,
    AdminCandidatesComponent,
    AdminCandidatesPersonalDataComponent,
    AdminCandidatesUserCurriculumComponent,
    AdminCandidatesNominationsComponent,
    BaremarModalComponent,
    StatusModalComponent,
    ButtonsComponent,
    EmployeeLabelComponent,
    RequirementOfferModalComponent,
    ExistsComponent,
    NestedMenuComponent,
    OptionsFieldComponent,
    CriterionContainerComponent,
    AddPositionModalComponent,
    CheckboxTableComponent,
    AddRequirementCriterionValorationComponent,
    ConditionalComponent,
    AddVacanciesModalComponent,
    CheckboxTableComponent,
    AddSubscriptionComponent,
    VisibilityFilterComponent,
    OtherMeritsComponent
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
    SelectionRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatRadioModule,
    MatBadgeModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatSlideToggleModule,
    TreeListModule,
    AvatarModule,
    DragDropModule,
    FileUploadModule,
    GridModule,
    ExcelModule,
    BreadcrumbModule
  ],
  exports: [
  ],
  entryComponents: [
    AddPhaseModalComponent,
    AddDocumentationModalComponent,
    AddPositionModalComponent,
    AddComponentModalComponent,
    LinkAnnouncementModalComponent,
    LinkOffersModalComponent,
    AddRequirementCriterionComponent,
    CriterionModalComponent,
    CombinationsModalComponent,
    AnnouncementModalComponent,
    OfferModalComponent,
    BaremarModalComponent,
    StatusModalComponent,
    RequirementOfferModalComponent,
    AddRequirementCriterionModalComponent,
    AddVacanciesModalComponent,
    AddSubscriptionComponent,
    OtherMeritsComponent
  ],
  providers: [
    SelectionApiService,
    CustomDataSource,
    NotifyService,
    CurriculumApiService,
    {
      provide: MAT_DATE_LOCALE, useValue: (window.sessionStorage.getItem('lang'))
        ? window.sessionStorage.getItem('lang')
        : 'es'
    }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SelectionModule {
  static forRoot(): any[] | import('@angular/core').Type<any> | import('@angular/core').ModuleWithProviders<{}> {
    throw new Error('Method not implemented.');


  }
}
