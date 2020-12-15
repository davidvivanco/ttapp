import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ApiService } from '../../../shared/services/api.service';

import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { LogsMessagesCommon } from '../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-unsubscribe-company-modal',
    templateUrl: 'unsubscribe-company-modal.component.html',
    styleUrls: ['unsubscribe-company-modal.component.scss']
})
export class UnsubscribeCompanyModalComponent implements OnInit {

    formGroup: FormGroup;
    loading = false;
    isNew: boolean;
    availableGroups: any;
    filteredGroups = [];
    private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
    private translations: LogsMessagesCommon;

    constructor(
        public dialogRef: MatDialogRef<UnsubscribeCompanyModalComponent>,
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private logsService: LogsService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    }

    ngOnInit() {
        this.translationsKeys = [
            'logsMessages.common.errorOccurred'
        ];
        this.getTranslations();

    }

    getTranslations(): void {
        this.translate.get(this.translationsKeys)
            .subscribe((translations: LogsMessagesCommon) => {

                this.translations = translations;
            });
    }

    close(): void {
        this.dialogRef.close();
    }

    unsubscribe() {
        this.apiService.unsubscribe().subscribe(res => {
            this.dialogRef.close();
            this.handleSuccess();
        }, this.handleError.bind(this));
    }

    handleError() {
        this.loading = false;
        this.logsService.logError(this.translations['logsMessages.common.errorOccurred']);
    }

    handleSuccess() {
        this.logsService.log('Cuenta dada de baja con éxito');
    }

}
