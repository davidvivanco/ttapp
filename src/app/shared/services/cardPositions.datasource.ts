import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CardPosition } from '../models/card-position.model';

export class CardPositionsDataSource implements DataSource<CardPosition> {
    public totalCardPositions = 0;
    public isSearch = false;
    private cardPositionsSubject = new BehaviorSubject<CardPosition[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: ApiService) { }

    load(search: string = null, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 'asc') {
        this.isSearch = true;
        this.loadingSubject.next(true);

        if (search) {
            this.searchCardPositions(search, page, rowsPerPage, sort, this.getSort(sortOrder));
        } else {
            this.loadCardPositions(page, rowsPerPage, sort, this.getSort(sortOrder));
        }
    }

    private loadCardPositions(page: number, rowsPerPage: number, sort = null, sortOrder = 1) {
        this.apiService.getAllCardPositions(page, rowsPerPage, sort, sortOrder)
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe(cardPositions => {
                this.totalCardPositions = cardPositions.total;
                this.cardPositionsSubject.next(cardPositions.documents);
            });
    }

    private searchCardPositions(search: string, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 1) {
        this.isSearch = true;
        this.loadingSubject.next(true);

        this.apiService.searchCardPositions(search, page, rowsPerPage, sort, sortOrder)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(cardPositions => {
                this.totalCardPositions = cardPositions.total;
                this.cardPositionsSubject.next(cardPositions.documents);
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

    connect(collectionViewer: CollectionViewer): Observable<CardPosition[]> {
        return this.cardPositionsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.cardPositionsSubject.complete();
        this.loadingSubject.complete();
    }

}