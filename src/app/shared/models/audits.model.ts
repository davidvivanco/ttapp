import { CommonFunctions } from 'src/app/commonFunctions';

export class Audits {
    currentUserId: string;
    objectId: string;
    type: string;
    dataBefore: {};
    dataAfter: {};
    show: boolean;
    constructor(audit?) {
        const container = {
            currentUserId: '',
            objectId: '',
            type: '',
            dataBefore: null,
            dataAfter: null,
            show: false
        };
        new CommonFunctions().assignsVars(this, container, audit);
    }
}
