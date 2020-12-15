import { VisibilityType } from '../../shared/types/selection';

export interface Subscription {
    employee: string;
    desubscribeAt: Date;
    searchParameters: SearchParameters;
}

export interface SearchParameters {
    position: string;
    offerType: Array<VisibilityType>;
    keywords: string;
}
