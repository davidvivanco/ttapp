import { CommonFunctions } from "src/app/commonFunctions";

export class Unity {
    _id?: string;
    name: string;
    desc: string;
    children: string[];
    users: string[];
    parentId: string;

    constructor(unity?) {
        const container = {
            name: '',
            desc: '',
            children: [],
            users: [],
        };
        new CommonFunctions().assignsVars(this, container, unity);
    }
}