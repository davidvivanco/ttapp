
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AuditsService } from '../../../shared/services/audits.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';


export class CustomDataSource implements DataSource<any> {
  public total = 0;
  public isSearch = false;
  private elementsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private auditsService: AuditsService) { }

  load(apiFunction: string, search: string = null, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 'asc', loaderActive) {
    this.getData(apiFunction, search, page, rowsPerPage, sort, this.getSort(sortOrder), loaderActive);
  }

  private getData(apiFunction: string, search: string, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 1, loaderActive) {
    this.isSearch = true;
    if (loaderActive) this.loadingSubject.next(true);

    this.auditsService[apiFunction](search, page, rowsPerPage, sort, sortOrder)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((data: any) => {
        this.total = data.total;
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
