import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Employee } from '../models/employee.model';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';

export class EmployeesDataSource implements DataSource<Employee> {
    public totalEmployees = 0;
    public isSearch = false;
    private employeesSubject = new BehaviorSubject<Employee[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: ApiService) { }

    load(search: string = null, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 'asc') {
        this.isSearch = true;
        this.loadingSubject.next(true);

        if (search) {
            this.searchEmployees(search, page, rowsPerPage, sort, this.getSort(sortOrder));
        } else {
            this.loadEmployees(page, rowsPerPage, sort, this.getSort(sortOrder));
        }
    }

    private loadEmployees(page: number, rowsPerPage: number, sort = null, sortOrder = 1) {
        this.apiService.getAllEmployees(page, rowsPerPage, sort, sortOrder)
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe(employees => {
                this.totalEmployees = employees.total;
                this.employeesSubject.next(employees.documents);
            });
    }

    private searchEmployees(search: string, page: number = 0, rowsPerPage: number = 10, sort = null, sortOrder = 1) {
        this.isSearch = true;
        this.loadingSubject.next(true);

        this.apiService.searchEmployee(search, page, rowsPerPage, sort, sortOrder)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(employees => {
                this.totalEmployees = employees.total;
                this.employeesSubject.next(employees.documents);
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

    connect(collectionViewer: CollectionViewer): Observable<Employee[]> {
        return this.employeesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.employeesSubject.complete();
        this.loadingSubject.complete();
    }

}