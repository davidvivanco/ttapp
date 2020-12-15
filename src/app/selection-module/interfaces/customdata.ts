export interface CustomDataSourceInterface {
    apiFunction: string;
    search: string;
    count: boolean;
    page: number;
    rowsPerPage: number;
    sort: string;
    sortField: string;
    sortOrder: any;
    loaderActive: boolean;
    idContainer: Array<string>;
    visibility: any;
    positionId?: string;
}

