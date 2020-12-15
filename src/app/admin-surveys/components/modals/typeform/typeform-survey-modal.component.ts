import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AdminSurveysApiService } from '../../../services/admin-surveys.api.services';
import { DashboardFilter } from 'src/app/shared/models/dashboard-filter.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-typeform-survey-modal',
    templateUrl: 'typeform-survey-modal.component.html',
    styleUrls: ['typeform-survey-modal.component.scss']
})
export class TypeformSurveyModalComponent implements OnInit {
    textLbel: string;
    formGroup: FormGroup;
    loading = false;
    sizes: string[];
    dashboardFilters: DashboardFilter[];
    dashboardFiltersSelected: DashboardFilter[];
    isNew: boolean;
    tsLiterals: any;

    constructor(
        public dialogRef: MatDialogRef<TypeformSurveyModalComponent>,
        private formBuilder: FormBuilder,
        private logsService: LogsService,
        private apiService: AdminSurveysApiService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.sizes = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12'];
        if (data.info && data.info.select) {
            this.dashboardFilters = data.dashboardFilters.filter(df => data.info.select.indexOf(df.id) === -1);
            this.dashboardFiltersSelected = data.dashboardFilters.filter(df => data.info.select.indexOf(df.id) !== -1);
        } else {
            this.dashboardFilters = Object.assign([], data.dashboardFilters);
            this.dashboardFiltersSelected = [];
        }

        if (!data.info) {
            this.isNew = true;
        }

        this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
            if (translated) this.tsLiterals = translated;
        });
    }

    ngOnInit() {
        if (this.data.type && this.data.type === 'row') { // ROW FORM
            this.formGroup = this.formBuilder.group({
                name: [this.data.info.name, Validators.required],
            });
        } else { // COL FORM
            this.formGroup = this.formBuilder.group({
                name: [this.data.info.name, Validators.required],
                mongoChartUrl: [this.data.info.mongoChartUrl, Validators.required],
                size: [this.data.info.size, Validators.required]
            });
        }
    }

    handleError() {
        this.loading = false;
        this.logsService.logError(this.tsLiterals.toastError);
    }

    handleSuccess() {
        this.logsService.log(this.tsLiterals.toastSuccess);
    }

    saveNewChip(filterToAdd, input?) {
        const indexFilter = this.dashboardFilters.findIndex(df => df.id === filterToAdd);
        if (indexFilter >= 0) {
            this.dashboardFiltersSelected.push(this.dashboardFilters[indexFilter]);
            this.dashboardFilters.splice(indexFilter, 1);
            if (input && input.length) input.map(inp => inp.value = '');
        }
    }

    deleteMatChip(filterToDelete) {
        const indexFilter = this.dashboardFiltersSelected.findIndex(df => df.id === filterToDelete);
        if (indexFilter >= 0) {
            this.dashboardFilters.push(this.dashboardFiltersSelected[indexFilter]);
            this.dashboardFiltersSelected.splice(indexFilter, 1);
        }
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.data.type && this.data.type === 'row') { // ROW FORM
            if (this.formGroup.invalid) {
                this.formGroup.get('name').markAsTouched();
                return;
            }
        } else { // COL FORM
            if (this.formGroup.invalid) {
                this.formGroup.get('name').markAsTouched();
                this.formGroup.get('mongoChartUrl').markAsTouched();
                this.formGroup.get('size').markAsTouched();
                return;
            }
        }

        const formData = this.formGroup.value;

        if (this.data.type && this.data.type === 'row') { // ROW FORM
            this.data.info.name = formData.name;
        } else { // COL FORM
            this.data.info.name = formData.name;
            this.data.info.mongoChartUrl = formData.mongoChartUrl;
            this.data.info.size = formData.size;
            this.data.info.select = [];
            for (const dashboard of this.dashboardFiltersSelected) {
                this.data.info.select.push(dashboard.id);
            }
        }

        this.close(this.data);
    }
}
