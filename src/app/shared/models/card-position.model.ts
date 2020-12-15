import { AddressDirection } from './address-direction.model';
import { CommonFunctions } from 'src/app/commonFunctions';



export class CardPosition {
    id: string;
    name: string;
    goals: string;
    area: string;
    department: string;
    addressDirection: AddressDirection;
    workCenter: string;
    hasEmployees: boolean;
    workdayType: string;
    category: string;
    report: any;
    tasks: string[];
    names: string[];
    languagesList: string[];
    educations: {
        computerKnowledges: object;
        studies: string[];
        other?: string[];
    };
    languages: object;
    driverLicenses: {
        hasForkliftTruckLicence?: boolean;
        B?: boolean;
        B_plus_E?: boolean;
        C?: boolean;
        C_plus_E?: boolean;
        D?: boolean;
        D_plus_E?: boolean;
        BTP?: boolean;
        other?: boolean;
    };
    competences: object[];
    positions: object[];
    kpis: string[];
    other: {
        sectorExperience: string;
        other: string[];
        highlights: string[];
    };

    constructor(cardPosition, driverLicenses) {
        const container = {
            name: '', goals: '', area: '', department: '', addressDirection: { ...AddressDirection },
            workCenter: '', hasEmployees: false, workdayType: '', report: '', tasks: [],
            educations: {
                computerKnowledges: {},
                studies: [],
                other: []
            },
            languages: {},
            languagesList: [],
            driverLicenses: driverLicenses,
            positions: [], kpis: [], competences: [],
            other: { sectorExperience: '', other: [], highlights: [] }
        };
        new CommonFunctions().assignsVars(this, container, cardPosition);
    }
}
