import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatExpansionModule } from '@angular/material/expansion';

// MATERIAL IMPORTS
import {
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSliderModule,
    // MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    // MatPaginatorIntl,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    // MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    MatSortModule,
    MatButtonToggleModule,
} from '@angular/material';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { AvatarModule } from '../shared/modules/avatar/avatarmodule.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { Dashboard } from './common/dashboard';
import { DashboardApiService } from './services/dahsboard.api.services';
import { RadialbarComponent } from './components/apex-charts/components/charts/radialbar/radialbar.component';
import { HeatmapComponent } from './components/apex-charts/components/charts/heatmap/heatmap.component';
import { BarComponent } from './components/apex-charts/components/charts/bar/bar.component';
import { SelectComponent } from './components/apex-charts/components/filters/select/select.component';
import { SliderComponent } from './components/apex-charts/components/filters/slider/slider.component';
import { RowComponent } from './components/apex-charts/components/row/row.component';
import { ToggleMergeComponent } from './components/apex-charts/components/filters/toggle-merge/toggle-merge.component';
import { ToggleComponent } from './components/apex-charts/components/filters/toggle/toggle.component';
import { DescriptionComponent } from './components/apex-charts/components/description/description.component';
import { SurveysComponent } from './pages/surveys/surveys.component';
import { GlobalComponent } from './pages/global/global.component';
import { PieComponent } from './components/apex-charts/components/charts/pie/pie.component';
import { SparklinesComponent } from './components/apex-charts/components/charts/sparklines/sparklines.component';
import { AreaComponent } from './components/apex-charts/components/charts/area/area.component';
import { GridComponent } from './components/apex-charts/components/grid/grid.component';
import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { GlobalFilterComponent } from './components/apex-charts/components/global-filter/global-filter.component';
import { SurveysMongoChartComponent } from './components/surveys-mongo-chart/surveys.component';
import { MoodComponent } from './pages/mood/mood.component';
import { TemplateGridComponent } from './components/apex-charts/components/grid/components/template-grid/template-grid.component';
import { ApexChartsComponent } from './components/apex-charts/apex-charts.component';
import { GridModalComponent } from './components/apex-charts/components/charts/bar/modals/grid-modal/grid-modal.component';


export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, `${environment.apiUrl}api/translations/`,
        '?block=manageCheckInOutCompany&block=manageCheckInOut&block=checkInOut&folder=main');
}



@NgModule({
    declarations: [
        SurveysComponent,
        ApexChartsComponent,
        MoodComponent,
        SurveysMongoChartComponent,
        RadialbarComponent,
        HeatmapComponent,
        BarComponent,
        SelectComponent,
        SliderComponent,
        RowComponent,
        ToggleMergeComponent,
        ToggleComponent,
        DescriptionComponent,
        GlobalComponent,
        PieComponent,
        SparklinesComponent,
        AreaComponent,
        GridComponent,
        GlobalFilterComponent,
        TemplateGridComponent,
        GridModalComponent],
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

        DashboardsRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatSortModule,
        MatButtonModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatDialogModule,
        MatCardModule,
        MatExpansionModule,
        MatSidenavModule,
        MatInputModule,
        MatSliderModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatNativeDateModule,
        MatTableModule,
        MatTabsModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatBadgeModule,
        MatAutocompleteModule,
        MatTreeModule,
        TreeListModule,
        GridModule,
        ExcelModule,
        AvatarModule,
        NgApexchartsModule],
    exports: [],
    entryComponents: [
        GridModalComponent
    ],
    providers: [
        Dashboard,
        DashboardApiService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DashboardsModule {
    static forRoot(): any[] | import('@angular/core').Type<any> | import('@angular/core').ModuleWithProviders<{}> {
        throw new Error('Method not implemented.');
    }
}
