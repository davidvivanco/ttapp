import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Audits } from 'src/app/shared/models/audits.model';
import { MatPaginator, MatDialog, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { AuditsService } from './../../shared/services/audits.service';
import { AuditsModalComponent } from './audits-modal/audits-modal.component';
import { FormControl } from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomDataSource } from './custom-data-source/custom-data-source';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-audits',
  templateUrl: './audits.component.html',
  styleUrls: ['./audits.component.scss']
})

export class AuditsComponent implements OnInit, OnDestroy, AfterViewInit {
  audits: Audits[];
  displayedColumns: string[] = ['audits', 'actions'];
  dataSource2 = new MatTableDataSource<any>([]);
  dataSource: CustomDataSource;
  public search = '';
  private page = 0;
  private pageSize = 10;
  selectedColumn = [
    { name: 'type', order: 'asc', icon: 'arrow_upward' },
    { name: 'type', order: 'desc', icon: 'arrow_downward' },
    { name: 'userObjectId', order: 'asc', icon: 'arrow_upward' },
    { name: 'userObjectId', order: 'desc', icon: 'arrow_downward' },
    { name: 'objectId', order: 'asc', icon: 'arrow_upward' },
    { name: 'objectId', order: 'desc', icon: 'arrow_downward' },
    { name: 'createdAt', order: 'desc', icon: '' },
    { name: 'createdAt', order: 'asc', icon: '' }
  ];
  selectedOption;
  // Custom Filter Predicate
  globalFilter = new FormControl('');
  public offersSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;

  constructor(private auditService: AuditsService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.type',
      'audits.editor',
      'audits.modifiedId',
      'genericMessages.newer',
      'genericMessages.older'
    ];
    this.getLogsTranslations();
    this.prepareTable();
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.search = str.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.loadAudits(false);
        }
      );
  }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadAudits(true);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribePendingObservables();
  }

  private unsubscribePendingObservables() {
    if (this.offersSubscription) {
      this.offersSubscription.unsubscribe();
    }
  }

  populateSortArr(arr) {
    arr[0].title = this.logsMessagesTranslations['genericMessages.type'];
    arr[1].title = this.logsMessagesTranslations['genericMessages.type'];
    arr[2].title = this.logsMessagesTranslations['audits.editor'];
    arr[3].title = this.logsMessagesTranslations['audits.editor'];
    arr[4].title = this.logsMessagesTranslations['audits.modifiedId'];
    arr[5].title = this.logsMessagesTranslations['audits.modifiedId'];
    arr[6].title = this.logsMessagesTranslations['genericMessages.newer'];
    arr[7].title = this.logsMessagesTranslations['genericMessages.older'];
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
        this.populateSortArr(this.selectedColumn);
      });
  }

  hasDataBefore(object) {
    const filtered = Object.keys(object).filter(key => key.includes('dataBefore'));
    return filtered.length > 0 ? true : false;
  }

  loadAudits(loaderActive) {
    this.dataSource.load(
      'getAudits',
      this.search,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      loaderActive);
  }

  prepareTable() {
    this.dataSource = new CustomDataSource(this.auditService);
    this.dataSource.load('getAudits', this.search, this.page, this.pageSize, 'type', 'asc', true);
  }

  openAuditsModal(inf, before) {
    if (before) {
      const filtered = Object.keys(inf)
        .filter(key => key.includes('dataBefore')).
        filter(key => !key.includes('_bsontype'))
        .reduce((obj, key) => {
          obj[key] = inf[key];
          return obj;
        }, {});
      const newobj = {};
      Object.keys(filtered).forEach((k, i) => {
        const aux = k.split('.');
        const l = aux[aux.length - 2].concat('-' + aux[aux.length - 1]);
        newobj[l] = filtered[k];
      });
      this.dialog.open(AuditsModalComponent, { data: { data: newobj, title: 'before' }, width: '800px' });
    } else {
      const filtered = Object.keys(inf)
        .filter(key => key.includes('dataAfter'))
        .filter(key => !key.includes('_bsontype'))
        .reduce((obj, key) => {
          obj[key] = inf[key];
          return obj;
        }, {});
      const newobj = {};
      Object.keys(filtered).forEach((k, i) => {
        const aux = k.split('.');
        const l = aux[aux.length - 2].concat('-' + aux[aux.length - 1]);
        newobj[l] = filtered[k];
      });
      this.dialog.open(AuditsModalComponent, { data: { data: newobj, title: 'after' }, width: '800px' });
    }
  }

  changeSortedColumn(event) {
    this.selectedOption = event.value;
    const sortState: Sort = { active: event.value.name, direction: event.value.order };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }
}
