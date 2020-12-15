import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { SelectionApiService } from '../../../../services/selection.api.services';
import { TranslateService } from '@ngx-translate/core';
import { BaremarModalComponent } from './baremar-component-modal/baremar-modal.component';
import { StatusModalComponent } from './status-component-modal/status-modal.component';
import { Employee } from '../../../../../shared/models/employee.model';
import { ApiService } from '../../../../../shared/services/api.service';
import { CommonFunctions } from '../../../../../commonFunctions';
import { Candidature } from '../../../../interfaces/candidature';


@Component({
  selector: 'app-admin-candidates-nominations',
  templateUrl: './admin-candidates-nominations.component.html',
  styleUrls: ['./admin-candidates-nominations.component.scss']
})
export class AdminCandidatesNominationsComponent implements OnInit {
  tsLiterals: any;
  candidatures: [any];
  total;
  page = 0;
  pageSize = 10;
  search = '';
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'status', 'actions'];
  searchResultsView = false;
  existingPositions = [];
  user: Employee

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input('fromAdmin') public fromAdmin: boolean = false;
  @Input() public employeeFromAdmin;

  @Output() onBack = new EventEmitter();
  @Output() onCandidatures = new EventEmitter<Employee>();
  @Output() onCurriculum = new EventEmitter<Employee>();
  @Output() onPersonalData = new EventEmitter<Employee>();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private translate: TranslateService,
    private apiService: ApiService,
    private commonFunctions: CommonFunctions,
  ) {
    this.translate.get('selectionAdmin.announcements.list.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;

    });
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.api.getCandidaturesByEmployee(this.employeeFromAdmin.id).subscribe(
      (data: any) => {
        if (data) {
          this.candidatures = data;
          this.prepareTable();
        }
      });
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description;
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  prepareTable() {
    this.dataSource = new MatTableDataSource<any>(this.candidatures);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
  }

  checkCandidature(candidature: Candidature) {
    const dialog = this.dialog.open(BaremarModalComponent, {
      data: { candidature },
      width: '800px'
    });

    dialog.afterClosed().subscribe(data => {
      //DO SOMETHING
    });
  }

  stateCandidature(candidature) {
    const dialog = this.dialog.open(StatusModalComponent, {
      data: { candidature }
    });

    dialog.afterClosed().subscribe(data => {
      //DO SOMETHING
    });
  }

  goBack = () => this.onBack.emit();

  goToCandidatures = () => this.onCandidatures.emit(this.employeeFromAdmin);

  goToCurriculum = () => this.onCurriculum.emit(this.employeeFromAdmin);

  goToPersonalData = () => this.onPersonalData.emit(this.employeeFromAdmin)

}
