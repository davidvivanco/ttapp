import { Periodicity } from './periodicity.model';
import { CommonFunctions } from 'src/app/commonFunctions';

export class CustomSurvey {
    _id?: string;
    title: string;
    welcomeText: string;
    feedbackText: string;
    periodicity: Periodicity;
    finishDate: Date;
    startDate: Date;
    mandatoryAnswers: boolean;
    mandatoryAnswersNumber?: number;
    userCanSeeReport?: boolean;
    state: string; // published, incomplete
    blocks: Array<CustomSurveyBlock>;

    constructor(survey?) {
        const container = {
            title: '',
            welcomeText: '',
            feedbackText: '',
            periodicity: { type: 'd', value: 1 },
            finishDate: '',
            startDate: '',
            mandatoryAnswers: false,
            mandatoryAnswersNumber: 0,
            userCanSeeReport: false,
            state: 'incomplete',
            blocks: []
        };
        new CommonFunctions().assignsVars(this, container, survey);
    }
}

export class CustomSurveyBlock {
    _id?: string;
    name: string;
    questions: Array<CustomSurveyQuestion>;

    constructor(block?) {
        const container = {
            name: '',
            questions: []
        };
        new CommonFunctions().assignsVars(this, container, block);
    }
}

export interface CustomSurveyQuestion {
    _id?: string;
    title: string;
    description: string;
    type: string;
    answers: Array<CustomSurveyAnswer>;
}

export interface CustomSurveyAnswer {
    _id?: string;
    name: string;
    type: string;
    urlImage?: string;
    urlVideo?: string;
    action: string;
}

export interface CustomSurveys {
    pendingSurveys: Array<CustomSurvey>;
    status: number;
}
