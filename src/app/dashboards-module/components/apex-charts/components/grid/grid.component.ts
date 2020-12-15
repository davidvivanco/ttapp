import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Col } from '../../interfaces/dashboard';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styles: [
    'node_modules/@progress/kendo-theme-default/dist/all.css'
  ]
})
export class GridComponent implements OnInit {
  loading: boolean;
  globalFilter = new FormControl('');
  pageSize = 5;
  page = 0;
  search: string;
  filter: any;
  group: any;
  gridView: any;

  dataSource: any;
  columns: any;
  detailTables: any;
  totalEmployees: number;
  searchFilters: any;

  @Input() chart: Col;
  @Input() dashboardId: string;
  @Input() cardPositionId: string;


  constructor(
    private router: Router
  ) {
    this.showLoading();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          if (str) {
            str = str.trim().toLowerCase();
            this.search = str ? str : null;
            this.setSearchFilters(str);
          } else {
            this.searchFilters = null;
          }
        }
      );
  }


  ngOnInit() {
    this.hideLoading();
  }

  setSearchFilters(str) {
    this.searchFilters = {};
    this.searchFilters['name'] = str;
    this.searchFilters['lastname'] = str;
    this.searchFilters['id'] = str;
    this.searchFilters['allEmails'] = str;
    this.searchFilters['allPhones'] = str;
  }

  showLoading(): void {
    this.loading = true;
  }

  hideLoading(): void {
    this.loading = false;
  }






}
