import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AdminSurveysApiService } from '../../../../services/admin-surveys.api.services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-question-modal',
    templateUrl: 'question-modal.component.html',
    styleUrls: ['question-modal.component.scss']
})
export class CustomSurveyQuestionModalComponent implements OnInit {
    textLbel: string;
    formGroup: FormGroup;
    loading = false;
    types: string[];
    isNew: boolean;
    tsLiterals: any;

    constructor(
        public dialogRef: MatDialogRef<CustomSurveyQuestionModalComponent>,
        private formBuilder: FormBuilder,
        private logsService: LogsService,
        private apiService: AdminSurveysApiService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.types = ['unique', 'multi'];

        if (!data.info.name) {
            this.isNew = true;
        }

        this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
            if (translated) this.tsLiterals = translated;
        });
    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            name: [this.data.info.name, Validators.required],
            description: [this.data.info.description, Validators.required],
            type: [this.data.info.type, Validators.required]
        });
    }

    handleError() {
        this.loading = false;
        this.logsService.logError(this.tsLiterals.toastError);
    }

    handleSuccess() {
        this.logsService.log(this.tsLiterals.toastSuccess);
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.get('name').markAsTouched();
            this.formGroup.get('description').markAsTouched();
            this.formGroup.get('type').markAsTouched();
            return;
        }
        const formData = this.formGroup.value;
        this.data.info.name = formData.name;
        this.data.info.description = formData.description;
        this.data.info.type = formData.type;
        this.close(this.data);
    }
}
