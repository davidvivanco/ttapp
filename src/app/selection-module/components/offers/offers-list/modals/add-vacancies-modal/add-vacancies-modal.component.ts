import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-add-vacancies-modal',
    templateUrl: 'add-vacancies-modal.component.html',
    styleUrls: ['add-vacancies-modal.component.scss']
})
export class AddVacanciesModalComponent implements OnInit {
    formGroup: FormGroup;
    loading = false;
    tsLiterals: any;

    constructor(
        public dialogRef: MatDialogRef<AddVacanciesModalComponent>,
        private formBuilder: FormBuilder,
        private logsService: LogsService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public title: string
    ) {
        this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
            if (translated) this.tsLiterals = translated;
        });
    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            vacancies: [ 0, Validators.required]
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
            this.formGroup.get('vacancies').markAsTouched();
            return;
        }
        
        const formData = this.formGroup.value;           
        this.close(formData.vacancies);
    }

}