import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { SelectionApiService } from '../../services/selection.api.services';
import { Injectable } from '@angular/core';
import { CustomDataSourceInterface } from '../../interfaces/customdata';



@Injectable()
export class CustomDataSource implements DataSource<any> {
    public total = 0;
    public data;
    public isSearch = false;
    private elementsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: SelectionApiService) {
    }

    load({ apiFunction, search = null, page = 0, rowsPerPage = 10, sort = null, sortOrder = 'asc', loaderActive, idContainer, visibility, positionId }: Partial<CustomDataSourceInterface>) {
        this.getData(apiFunction, search, page, rowsPerPage, sort, this.getSort(sortOrder), loaderActive, idContainer, visibility, positionId);
    }

    private getData(apiFunction: string, search: string, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 1, loaderActive: boolean, idContainer?: Array<string>, visibility?: any, positionId?: string) {
        this.isSearch = true;
        if (loaderActive) this.loadingSubject.next(true);

        this.apiService[apiFunction]({ search, page, rowsPerPage, sort, sortOrder, loaderActive: true, idContainer, visibility, positionId })
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((data: any) => {
                this.total = data.total;
                this.data = data;
                this.elementsSubject.next(data.pagination);
            });
    }

    private getSort(sortOrder: string) {
        switch (sortOrder) {
            case 'asc':
                return 1;
            case 'desc':
                return -1;
            default:
                return 1;
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this.elementsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.elementsSubject.complete();
        this.loadingSubject.complete();
    }

}