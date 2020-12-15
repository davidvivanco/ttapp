import { CommonFunctions } from 'src/app/commonFunctions';
export class MenuUrl {
    title: string;
    icon: string;
    desc: string;
    blank: boolean;
    iframe: boolean;
    linkType: boolean;
    innerLink: string;
    webLink: string;
    permissions?: string[];
    published?: string;
    manager?: boolean;
    constructor(url?) {
        const container = {
            title: '',
            icon: '',
            desc: '',
            blank: null,
            iframe: null,
            linkType: null,
            innerLink: '',
            webLink: '',
            permission: [],
            manager: false
        };
        new CommonFunctions().assignsVars(this, container);
    }
}
