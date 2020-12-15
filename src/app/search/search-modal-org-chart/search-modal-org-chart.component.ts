import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MatPaginator, MatSort } from '@angular/material';
import { ApiService } from '../../shared/services/api.service';
import { CommonFunctions } from '../../commonFunctions';
import { CardPositionsDataSource } from '../../shared/services/cardPositions.datasource';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-modal-org-chart-position',
  templateUrl: './search-modal-org-chart.component.html'
})
export class SearchModalOrgChartComponent implements OnInit, AfterViewInit {
  private page = 0;
  private pageSize = 10;
  private search: string = null;

  inputSearchGlobal: string;
  dataSource: CardPositionsDataSource;
  displayedColumns: string[] = ['name', 'select'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SearchModalOrgChartComponent>,
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
    this.dataSource = new CardPositionsDataSource(this.apiService);
    this.dataSource.load(this.search, this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadCardPositions())
      )
      .subscribe();
  }

  loadCardPositions() {
    this.dataSource.load(
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction);
  }

  highLightUser(cardPosition) {
    this.dialogRef.close(cardPosition.id);
  }


  onEnterKeyPress(val) {
    if (val && val !== '') this.searchGlobal();
  }

  closeModal() {
    this.dialogRef.close();
  }

  applyFilter(filterValue: string) {
    filterValue = CommonFunctions.getCleanedString(filterValue);
    this.search = filterValue.trim().toLowerCase();
    if (this.paginator) this.paginator.firstPage();
    this.loadCardPositions();
  }

  searchGlobal() {
    if (this.inputSearchGlobal.trim()) {
      this.router.navigate(['/organigrama'], { queryParams: { search: this.inputSearchGlobal.trim().toLowerCase() } });
      this.inputSearchGlobal = '';
    }
    this.closeModal();
  }

}
