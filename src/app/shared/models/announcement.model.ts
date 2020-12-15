import { Offer } from './offer.model';
import { CommonFunctions } from 'src/app/commonFunctions';

export class Announcement {
    _id?: string;
    title: string;
    description: string;
    category: string;
    visibility: string;
    vacancies: number;
    startsAt: Date;
    finishAt: Date;
    state: string;
    offers: Offer[];
    isPublishable?: boolean;

    constructor(announcement?) {
        const container = {
            title: '',
            description: '',
            category: '',
            visibility: '',
            vacancies: 0,
            startsAt: '',
            finishAt: '',
            state: '',
            offers: []
        };
        new CommonFunctions().assignsVars(this, container, announcement);
    }
}

