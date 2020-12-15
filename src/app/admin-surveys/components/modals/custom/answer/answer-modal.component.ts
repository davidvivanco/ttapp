import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AdminSurveysApiService } from '../../../../services/admin-surveys.api.services';
import { TranslateService } from '@ngx-translate/core';
import { MultipleFilesUploaderComponent } from 'src/app/multiple-files-uploader/multiple-files-uploader.component';
import { UploadTemplateModalComponent } from 'src/app/admin/users/upload-template-modal/upload-template-modal.component';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';

@Component({
    selector: 'app-answer-modal',
    templateUrl: 'answer-modal.component.html',
    styleUrls: ['answer-modal.component.scss']
})
export class CustomSurveyAnswerModalComponent implements OnInit {
    textLbel: string;
    formGroup: FormGroup;
    loading = false;
    types: string[];
    isNew: boolean;
    tsLiterals: any;
    dataUploader: any;
    urlFiles: string[];

    private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
    private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

    constructor(
        public dialogRef: MatDialogRef<CustomSurveyAnswerModalComponent>,
        private formBuilder: FormBuilder,
        private logsService: LogsService,
        private apiService: AdminSurveysApiService,
        private translate: TranslateService,
        public dialog: MatDialog,
        public dialogRefUpload: MatDialogRef<UploadTemplateModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.types = ['text', 'image', 'video'];
        if (!data.info.name) {
            this.isNew = true;
        }

        this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
            if (translated) this.tsLiterals = translated;
        });
        this.urlFiles = [];
    }

    ngOnInit() {
        const reg = '^((https|http):\\/\\/)?([a-z\\d_]+\\.)?(([a-zA-Z\\d_]+)(\\.[a-zA-Z]{2,6}))(\\/[a-zA-Z\\d_\\%\\-=\\+]+)*(\\?)?([a-zA-Z\\d=_\\+\\%\\-&\\{\\}\\:]+)?';
        this.formGroup = this.formBuilder.group({
            name: [this.data.info.name, Validators.required],
            action: [this.data.info.action, Validators.required],
            type: [this.data.info.type, Validators.required],
            // image: [this.data.info.type, Validators.required],
            urlVideo: [this.data.info.urlVideo, Validators.pattern(reg)]
        });

        this.translationsKeys = [
            'logsMessages.common.uploading',
            'logsMessages.common.uploadCancel'
        ];
        this.getTranslations();
    }

    getTranslations(): void {
        this.translate.get(this.translationsKeys)
          .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
            this.translations = translations;
          });
      }

    handleError() {
        this.loading = false;
        this.logsService.logError(this.tsLiterals.toastError);
    }

    handleSuccess() {
        this.logsService.log(this.tsLiterals.toastSuccess);
    }

    uploadFiles() {
        const dialog = this.dialog.open(MultipleFilesUploaderComponent, { width: '500px', data: { singleFile: true } });
        dialog.afterClosed().subscribe(async data => {
            this.dataUploader = data.data;
        });
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.get('name').markAsTouched();
            this.formGroup.get('action').markAsTouched();
            this.formGroup.get('type').markAsTouched();
            this.formGroup.get('urlVideo').markAsTouched();
            return;
        }

        const formData = this.formGroup.value;
        this.data.info.name = formData.name;
        this.data.info.action = formData.action;
        this.data.info.type = formData.type;
        this.data.info.urlVideo = formData.urlVideo;

        if (this.dataUploader) {
            this.uploadSubmit();
        } else {
            this.close(this.data);
        }
    }

    uploadSubmit(): any {
        try {
            this.dataUploader.queue.forEach(file => {
                file.url = file.url + `?path=customPath&privateFile=false`;
            });
            this.dataUploader.uploadAll();

            this.dataUploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
                let jsonResponse = JSON.parse(response);
                this.urlFiles.push(jsonResponse.uploadedFile.fullPath);
            };

            this.dataUploader.onCompleteAll = () => {
                this.data.info.urlImagen = (this.urlFiles && this.urlFiles.length > 0) ? this.urlFiles[0] : '';
                this.logsService.log(this.translations['logsMessages.common.uploading']);
                this.close(this.data);
            };
        } catch (error) {
            this.logsService.logError(this.translations['logsMessages.common.uploadCancel']);
        }
    }
}
