import { CommonFunctions } from 'src/app/commonFunctions';

export class Address {
    street: string;
    number: string;
    country: string;
    province: string;
    city: string;
    zipCode: string;

    constructor(address?) {
        const container = {
            street: '',
            number: '',
            country: '',
            province: '',
            city: '',
            zipCode: ''
        };
        new CommonFunctions().assignsVars(this, container, address);
    }
}
