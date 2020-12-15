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
  MatDatepickerModule,
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
  MatSidenavModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatSortModule,
  MatSlideToggleModule,
  MatRadioModule,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { TreeListModule } from '@progress/kendo-angular-treelist';

import { GuidelinesRoutingModule } from './guidelines-routing.module';
import { GuidelinesComponent } from './pages/basic/guidelines.component';
import { GuidelinesButtonsComponent } from './pages/buttons/buttons.component';
import { GuidelinesColumnsGridComponent } from './pages/guidelines-columns-grid/guidelines-columns-grid.component';
import { GuidelinesUsersListComponent } from './pages/guidelines-users-list/guidelines-users-list.component';
import { GuidelinesItemsTableComponent } from './pages/guidelines-items-table/guidelines-items-table.component';
import { GuidelinesModalsComponent, ModalExampleComponent } from './pages/guidelines-modals/guidelines-modals.component';
import { CardsComponent } from './pages/cards/cards.component';
import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';
import { ModalsComponent } from './modals/modals.component';
import { GuidelinesUxComponent } from './pages/guidelines-ux/guidelines-ux.component';
import { TreeComponent } from './pages/tree/tree.component';
import { ListsComponent } from './pages/lists/lists.component';
import { FormsComponent } from './pages/forms/forms.component';
import { AppDateAdapter } from '../shared/formatters/format-datepicker';
import { Platform } from '@angular/cdk/platform';
import { LoadfilesComponent } from './pages/loadfiles/loadfiles.component';
import { BreadcrumbModule } from '../shared/modules/breadcrumb/breadcrumbmodule.module';
import { BasicComponentComponent } from './pages/basic-component/basic-component.component';
import { GuideLinesMatChipsComponent } from './pages/guide-lines-mat-chips/guide-lines-mat-chips.component';
import { GuidelinesIconsComponent } from './pages/guidelines-icons/guidelines-icons.component';
import { GuidelinesParentChildComponent } from './pages/guidelines-parent-child/guidelines-parent-child.component';
import { GuidelinesColorsComponent } from './pages/guidelines-colors/guidelines-colors.component';
import { SelectionComponent } from './pages/selection/selection.component';
import { StatesOffersConvocComponent } from './pages/selection/states-offers-convoc/states-offers-convoc.component';
import { RequiredOffersConvocComponent } from './pages/selection/required-offers-convoc/required-offers-convoc.component';
import { RequirementsAndCriteriaComponent } from './pages/selection/requirements-and-criteria/requirements-and-criteria.component';
import { SchemasComponent } from './pages/schemas/schemas.component';
import { SchemaCurriculumComponent } from './pages/schemas/schema-curriculum/schema-curriculum.component';
import { SchemaPersonalDataComponent } from './pages/schemas/schema-personal-data/schema-personal-data.component';

@NgModule({
  declarations: [
    GuidelinesComponent,
    GuidelinesButtonsComponent,
    GuidelinesColumnsGridComponent,
    GuidelinesUsersListComponent,
    GuidelinesItemsTableComponent,
    GuidelinesModalsComponent,
    ModalExampleComponent,
    CardsComponent,
    ModalsComponent,
    GuidelinesUxComponent,
    TreeComponent,
    ListsComponent,
    FormsComponent,
    LoadfilesComponent,
    BasicComponentComponent,
    GuideLinesMatChipsComponent,
    GuidelinesIconsComponent,
    GuidelinesParentChildComponent,
    GuidelinesColorsComponent,
    SelectionComponent,
    StatesOffersConvocComponent,
    RequiredOffersConvocComponent,
    RequirementsAndCriteriaComponent,
    SchemasComponent,
    SchemaCurriculumComponent,
    SchemaPersonalDataComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GuidelinesRoutingModule,
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
    TreeListModule,
    MatSlideToggleModule,
    MatRadioModule,
    AvatarModule,
    BreadcrumbModule
  ],
  exports: [
  ],
  entryComponents: [
    ModalExampleComponent,
    ModalsComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter, deps: [MAT_DATE_LOCALE, Platform]},
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    // { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class GuidelinesModule {
  static forRoot(): any[] | import('@angular/core').Type<any> | import('@angular/core').ModuleWithProviders<{}> {
    throw new Error('Method not implemented.');

  }
}
