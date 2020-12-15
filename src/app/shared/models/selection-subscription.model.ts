import { CommonFunctions } from 'src/app/commonFunctions';

export class selectionSubscription {
    _id?: string;
    position: string;
    offerType: Array<string>;

    constructor(subscription?) {
        const container = {
            position: '',
            offerType: []
        };
        new CommonFunctions().assignsVars(this, container, subscription);
    }
}