export interface Offer {
    _id: string;
    requirements: any[];
    candidatures: string[];
    state: string;
    title: string;
    description: string;
    position: string;
    category: string;
    visibility: string;
    vacancies: number;
    salary: number;
    finishAt: string;
    startsAt: string;
    phases: any[];
    fees: number;
    requirement: string;
    documentation: Documentation[];
    searchTags: string;
    publishedAt: string;
    updatedAt: string;
    isValid?: boolean;
    applied?: boolean;
    subscribed?: boolean;
}

export interface Documentation {
    _id: string;
    visibility: string;
}
