import { CommonFunctions } from 'src/app/commonFunctions';
import { Requirement } from '../../selection-module/interfaces/requirement';
import { PhasesType, VisibilityType, StateType } from '../types/selection';


export class Offer {
    _id?: string;
    title: string;
    description: string;
    position: any;
    category: string;
    visibility: VisibilityType;
    vacancies: number;
    salary: number;
    startsAt: Date;
    finishAt: Date;
    requirement: Requirement;
    // applicants: [Schema.Types.ObjectId, ref: 'employees' }],
    phases: [{
        title: string;
        description: string;
        startsAt: Date;
        finishAt: Date;
        type: PhasesType
        url: string;
        attachedFiles: [];
    }];
    state: StateType;
    documentation: [{
        visibility: string;
        file: string;
        title: string;
    }];
    urlAnnouncement: string;
    announcement?: {
        title?: string;
        _id?: string;
    };
    fees: number;
    isValid: boolean;


    constructor(offer?) {
        const container = {
            title: '',
            description: '',
            position: '',
            category: '',
            visibility: '',
            vacancies: 0,
            salary: 0,
            startsAt: '',
            finishAt: '',
            requirement: null,
            phases: [],
            state: '',
            documentation: [],
            urlAnnouncement: '',
            fees: 0
        };
        new CommonFunctions().assignsVars(this, container, offer);
    }
}
