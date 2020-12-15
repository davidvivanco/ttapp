import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CustomSurveyInterface } from './custom-survey-interface';
import { ApiService } from 'src/app/shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { InfoModalComponent } from '../info-modal/info-modal.component';
import { MediaContent } from 'src/app/app-media-content/media.model';
import { EventService } from '../../../../services/event.service';

@Component({
    selector: 'app-custom-survey-modal',
    templateUrl: 'custom-survey-modal.component.html',
    styleUrls: ['custom-survey-modal.component.scss']
})
export class CustomSurveyModalComponent implements OnInit {
    customForm: FormGroup;
    loading = false;
    tsLiterals: any;
    public isLast: boolean;
    objectData: CustomSurveyInterface;
    visibility = [];
    questionShowing: number;
    showQuestions = false;
    showWelcome = true;
    showFeedback = false;
    showAnswers = false;
    mediaContent: MediaContent;

    private logsMessagesKeys: Array<string>;
    private logsMessagesTranslations: any;

    constructor(
        public dialogRef: MatDialogRef<CustomSurveyModalComponent>,
        private logsService: LogsService,
        private translate: TranslateService,
        public api: ApiService,
        public dialog: MatDialog,
        private eventService: EventService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isLast = false;
        this.translate.get('surveysAdmin.tsLiterals').subscribe((translated: string) => {
            if (translated) this.tsLiterals = translated;
        });
        this.objectData = data.survey;
        this.questionShowing = 0;
        this.prepareQuestions();
    }

    ngOnInit() {
        this.createForm();
        this.numQuestions();
        this.questionsInArray();
        this.logsMessagesKeys = [
            'logsMessages.admin.surveySaveSuccess',
            'surveysUser.closeModalInfo',
            'genericMessages.close',
            'genericMessages.confirm'
        ];
        this.getLogsTranslations();
    }

    getLogsTranslations(): void {
        this.translate.get(this.logsMessagesKeys).subscribe((translations: any) => {
            this.logsMessagesTranslations = translations;
        });
    }

    numQuestions() {
        return this.questionsInArray().length;
    }

    createForm(): void {
        this.customForm = new FormGroup({});
        this.questionsInArray().forEach(item => {
            this.customForm.addControl(item._id, new FormControl((item.type === 'multi') ? [] : '', [Validators.required]));
        });
        this.prepareControls();
    }

    prepareControls() {
        let arrControls = [];
        arrControls = Object.values(this.customForm.controls);
        return arrControls;
    }

    handleError(): void {
        this.loading = false;
        this.logsService.logError(this.tsLiterals.toastError);
    }

    handleSuccess(): void {
        this.logsService.log(this.logsMessagesTranslations['logsMessages.admin.surveySaveSuccess']);
    }

    close(data?: any): void {
        this.customForm.invalid ? this.openCloseModal() : this.dialogRef.close(data);
    }

    openCloseModal(): void {
        const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
            data: {
                title: this.logsMessagesTranslations['genericMessages.close'],
                message: this.logsMessagesTranslations['surveysUser.closeModalInfo'],
                confirm: this.logsMessagesTranslations['genericMessages.confirm']
            }
        });
        dialog.afterClosed().subscribe(res => {
            if (res) this.dialogRef.close();
        });
    }

    openInfoModal(): void {
        this.dialog.open(InfoModalComponent, {
            data: {
                message: this.objectData.welcomeText
            }
        });
    }

    viewFullSize(urlMedia: string, typeMedia: string): void {
        this.eventService.showMediaModal.emit({ show: true, urlMedia, typeMedia });
    }

    finishSurvey(): void {
        this.dialogRef.close();
    }

    setValue($event, option, question): void {
        let arr = this.customForm.get(question._id).value;
        if (!arr.some(item => item.name === option.name)) arr.push(option);
        if (arr.some(item => item.name === option.name) && $event.checked === false) arr = arr.filter(item => item.name !== option.name);
        this.customForm.get(question._id).setValue(arr);
    }

    submit(): void {
        this.prepareAnswers();
        let objectToSend = {};
        this.prepareReponses();
        objectToSend = {
            survey: this.objectData._id,
            responses: this.prepareReponses()
        }
        this.api.addCustomSurveyResponses(objectToSend).subscribe(() => this.handleSuccess(), this.handleError.bind(this));
    }

    prepareReponses() {
        let arrResponses = [];
        arrResponses = Object.values(this.customForm.value);
        arrResponses.forEach((item, index) => {
            if (!Array.isArray(item)) arrResponses[index] = [item];
        });
        arrResponses.forEach((answers, index) => {
            arrResponses[index] = {
                name: this.questionsInArray()[index].name,
                description: this.questionsInArray()[index].description,
                type: this.questionsInArray()[index].type,
                answers
            }
        });
        return arrResponses;
    }

    prepareAnswers() {
        let arrResponses = [];
        arrResponses = Object.values(this.customForm.value);
        return arrResponses;
    }

    prepareQuestions(): void {
        this.questionsInArray().forEach((_: any, i: number) => {
            this.visibility[i] = (i === this.questionShowing) ? {} : { display: 'none' };
        });
    }

    questionsInArray() {
        const arrayQuestions = [];
        this.objectData.blocks.forEach(elem => {
            elem.questions.forEach(item => {
                arrayQuestions.push(item);
            });
        });
        return arrayQuestions;
    }

    nextQuestion(): void {
        this.questionShowing++;
        this.prepareQuestions();
    }

    beforeQuestion(): void {
        this.questionShowing--;
        this.prepareQuestions();
    }

    beginForm(): void {
        this.showQuestions = true;
        this.showWelcome = false;
    }

    beginFeedback(): void {
        this.showFeedback = true;
        this.showQuestions = false;
        this.submit();
    }

    seeAnswers(): void {
        this.showAnswers = true;
        this.showFeedback = false;
        this.questionShowing = 0;
        this.visibility.length = 0;
        this.prepareQuestions();
    }

}