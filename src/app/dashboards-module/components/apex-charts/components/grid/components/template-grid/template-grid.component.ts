import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { State, filterBy, groupBy } from '@progress/kendo-data-query';
import { process } from '@progress/kendo-data-query';
import { Col } from '../../../../interfaces/dashboard';
import { forkJoin } from 'rxjs';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DashboardApiService } from '../../../../../../services/dahsboard.api.services';

@Component({
  selector: 'app-grid-template',
  templateUrl: './template-grid.component.html',
  styleUrls: ['./template-grid.component.scss']
})
export class TemplateGridComponent implements OnInit {

  loading: boolean;
  pageSize = 10;
  page = 0;
  search: any;
  filter: any;
  group: any;
  gridView: any;
  dataSource: any;
  detailsTableKeys: Array<string>;
  listEmployees = [];
  listElements = [];
  preventLoadEmployees = false;
  totalEmployees: number;
  state: State = {
    skip: 0,
    take: 10,
  };

  @Input() chart: Col;
  columns = [
    {
      "field": "id",
      "width": 60,
      "hidden": false,
      "label": "ID"
    },
    {
      "field": "name",
      "width": 100,
      "hidden": false,
      "label": "Nombre"
    },
    {
      "field": "lastname",
      "width": 100,
      "hidden": false,
      "label": "Apellidos"
    },
    {
      "field": "birthdate",
      "width": 50,
      "hidden": true,
      "label": "Fecha de Nacimiento "
    },
    {
      "field": "gender",
      "width": 80,
      "hidden": false,
      "label": "Género"
    },
    {
      "field": "workplace",
      "width": 100,
      "hidden": true,
      "label": "Lugar de trabajo"
    },
    {
      "field": "unity",
      "width": 100,
      "hidden": false,
      "label": "Unidad"
    },
    {
      "field": "position",
      "width": 100,
      "hidden": false,
      "label": "Posición"
    },
    {
      "field": "professionalCategory",
      "width": 100,
      "hidden": true,
      "label": "Categoría profesional"
    },
    {
      "field": "seniority",
      "width": 50,
      "hidden": true,
      "label": "Antigüedad"
    }
  ];
  @Input() data: any;
  @Input() key: string;
  @Input() subDataSource: any;
  @Input() subColumns: any;
  @Input() detailTables: any;
  @Input() fileName = 'download';
  @Input() callback = null;
  @Input() showDetails: boolean;
  @Input() dashboardId: string;
  @Input() cardPositionId: string;

  @Input() set searchFilters(value: boolean) {

    this.listEmployees = [];
    this.showLoading();

    if (value) {
      this.preventLoadEmployees = false;
      this.search = value;
      this.pageChange(this.state as PageChangeEvent);
    } else {
      this.search = null;
    }

    if (!value && value !== undefined) {
      this.preventLoadEmployees = true;
      const employees = this.data.data.map(employee => ({
        ...employee.data,
        detailTables: employee.detailTables || null
      }));
      this.totalEmployees = null;
      this.listEmployees = [];
      this.loadEmployees(employees);
      this.setGridViewData();
    }
  }
  constructor(private dashboardApiService: DashboardApiService) { }

  ngOnInit() {

    if (this.callback) this[this.callback]();
    else if (this.key) {
      this.state.take = 2;
      this.pageSize = 2;
      this.fileName = this.key.toLowerCase().replace(' ', '_');
      this.listElements = this.data.data.map(e => ({
        ...e
      }));
      this.columns = this.data.columns.map(column => ({
        field: column.field,
        label: column.label,
        width: 100,
        hidden: false,
      }));
      this.setGridViewSubData();
    } else {
      if (this.cardPositionId) {// data para la modal de cardpositions
        this.dashboardApiService.getChartData(this.dashboardId, { cardPositionId: this.cardPositionId }, this.chart.id)
          .subscribe(res => {
            this.data = res[this.chart.id];
            const employees = this.data.data.map(employee => ({
              ...employee.data,
              detailTables: employee.detailTables || null
            }));
            this.loadEmployees(employees);
            this.setGridViewData();
          });

      } else {
        const employees = this.data.data.map(employee => ({
          ...employee.data,
          detailTables: employee.detailTables || null
        }));
        this.loadEmployees(employees);
        this.setGridViewData();
      }
    }
  }

  loadEmployees(employees): void {
    for (const employee of employees) {
      this.listEmployees.push(employee);
    }
  }

  setGridViewSubData(): void {
    this.dataSource = this.listElements;
    this.gridView = process(this.dataSource, this.state);
    this.gridView.total = this.data.data.length;
    this.hideLoading();
  }


  setGridViewData(): void {
    this.dataSource = this.listEmployees;
    this.gridView = process(this.dataSource, this.state);
    this.gridView.total = (this.totalEmployees) ? this.totalEmployees : this.data.totalDocs;
    this.hideLoading();
  }

  showLoading(): void {
    this.loading = true;
  }

  hideLoading(): void {
    this.loading = false;
  }

  pageChange(state: PageChangeEvent) {
    this.state.skip = state.skip;
    if (this.listElements.length) {
      this.dataSource = this.listElements.slice(state.skip, state.skip + this.state.take);
      this.setGridViewSubData();
    } else {
      const totalEmployeesLoaded = this.listEmployees.length;
      if (this.employeesAreAlreadyLoaded(totalEmployeesLoaded, this.state.skip)) {
        this.setGridViewData();
        return;
      } else this.loadNewEmployees(totalEmployeesLoaded, state);
    }

  }


  employeesAreAlreadyLoaded(totalEmployeesLoaded: number, totalEmployeesRequired: number): boolean {
    return totalEmployeesLoaded > totalEmployeesRequired;
  }

  loadNewEmployees(totalEmployeesLoaded, state: PageChangeEvent) {
    this.showLoading();
    const lastPageLoaded = totalEmployeesLoaded / state.take;
    const whatPageLoad = state.skip / state.take;
    this.getAllPagesRequired(lastPageLoaded, whatPageLoad);
  }

  getAllPagesRequired(lastPageLoaded, whatPageLoad) {
    const promises = [];

    for (let page = lastPageLoaded; page <= whatPageLoad; page++) {
      if (this.search) {
        const data: { search?: any, filters?: any } = { search: { ...this.search } };
        if (this.cardPositionId) {
          data.filters = {
            cardPositionId: this.cardPositionId
          };
        }
        promises.push(this.dashboardApiService.getSearch(this.dashboardId, this.chart.id, data, page));
      } else promises.push(this.dashboardApiService.getPagination(this.dashboardId, this.chart.id, page));
    }

    forkJoin(promises).subscribe((res: any) => {
      const totalDocs = (res) ? res[0][this.chart.id].totalDocs : 0;
      if (this.search) this.listEmployees = [];

      for (const e of res) {
        if (!this.preventLoadEmployees) {
          const employees = e[this.chart.id].data.map(employee => ({
            ...employee.data,
            detailTables: employee.detailTables || null
          }));
          this.listEmployees.push(...employees);
        }

        this.totalEmployees = (this.search) ? totalDocs : null;
        this.setGridViewData();
        this.hideLoading();
      }
    });
  }

  groupChange(group) {
    if (this.thereIsNoGroup(group)) this.pageChange(this.state as PageChangeEvent);

    this.group = group;
    this.gridView = groupBy(this.dataSource, group);
    this.gridView.total = this.dataSource.length;
  }

  filterChange(filter: any) {
    if (this.thereIsNofilter(filter)) {
      this.pageChange(this.state as PageChangeEvent);
    } else {
      this.filter = filter;
      this.gridView = filterBy(this.dataSource, filter);
      this.gridView.total = this.dataSource.length;
    }
  }


  thereIsNoGroup(group: any): boolean {
    return group && !group.length;
  }

  thereIsNofilter(filter: any): boolean {
    return filter.filters && !filter.filters.length;
  }

  thereIsOnefilter(filter: any): boolean {
    return filter.filters && filter.filters.length === 1;
  }

  getDetailsKeys(details) {
    return Object.keys(details);
    // return Object.keys(details).filter(key => key !== 'contactDataEmail' && key !== 'contactDataPhone');
  }


  setContactData() {
    this.showLoading();
    this.dataSource = this.data;

    this.columns = [{
      'field': 'contact',
      'width': 50,
      hidden: false,
      label: 'Contacto'
    },
    {
      'field': 'type',
      'width': 50,
      hidden: false,
      label: 'Tipo'

    },
    {
      'field': 'category',
      'width': 50,
      hidden: false,
      label: 'Categoría'
    }];

    let data = [];

    const contactDataEmail = (this.dataSource.contactDataEmail) ? this.dataSource.contactDataEmail.data : [];
    const contactDataPhone = (this.dataSource.contactDataPhone) ? this.dataSource.contactDataPhone.data : [];
    if (contactDataEmail.length) {
      const arrTemp = contactDataEmail.map(email => ({
        'contact': email.email,
        'category': email.category,
        'type': 'Email'
      }));

      data = [...data, ...arrTemp];
    }

    if (contactDataPhone.length) {
      const arrTemp = contactDataPhone.map(phone => ({
        'contact': phone.phone,
        'category': phone.category,
        'type': 'Teléfono'
      }));

      data = [...data, ...arrTemp];
    }

    this.dataSource = data;
    this.gridView = process(this.dataSource, this.state);
    this.gridView.total = this.dataSource.length;
    this.hideLoading();
  }



}
