import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Unity } from 'src/app/shared/models/unity.model';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UnitiesApiService } from '../../../services/unities.api.service';

@Component({
  selector: 'app-unities-modal',
  templateUrl: './unities-modal.component.html'
})
export class UnitiesModalComponent implements OnInit {
  @Output() onClose: EventEmitter<true>;
  @Output() onSubmit: EventEmitter<any>;
  @Output() onCancel: EventEmitter<any>;

  multiple = true;
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  totalPages: any;
  displayedColumns: string[] = ['name', 'check'];
  existingUnities: any;

  tsLiterals: any;

  elementSelected: any;
  elementsSelected: Array<any>;
  globalFilter: FormControl;
  isTextToggled: boolean;
  search: string;

  unityId: string;

  public pageSize = 5;
  public currentPage = 0;
  public totalSize = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private translate: TranslateService,
    private logsService: LogsService,
    private apiService: UnitiesApiService,
    public dialogRef: MatDialogRef<UnitiesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.onClose = new EventEmitter();
    this.onCancel = new EventEmitter();
    this.onSubmit = new EventEmitter();
    this.globalFilter = new FormControl('');
    this.elementsSelected = [];
    this.isTextToggled = false;

    if (data && data.unityId) {
      this.unityId = data.unityId;
    }

    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.currentPage = 0;
          if (!str) {
            this.dataSource = new MatTableDataSource<any>(this.existingUnities.slice(0, 5));
            this.pageSize = 5;
            this.totalSize = this.existingUnities.length;
          }
          this.search = str.trim().toLowerCase();
          const searched = this.existingUnities.filter(r => r[(r.title) ? 'title' : 'name'].toLowerCase().indexOf(this.search) >= 0);
          this.dataSource = new MatTableDataSource<any>(searched.slice(0, this.pageSize));
          this.totalSize = searched.length;
        }
      );

    this.translate.get('unitiesAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
  }

  ngOnInit() {
    this.getUnities();
  }

  getUnities() {
    this.loading = true;
    if (this.unityId) {
      return this.apiService.getWithoutParent(this.unityId).subscribe((unities: any[]) => {
        this.existingUnities = unities;
        this.dataSource = new MatTableDataSource<Unity>(unities);
        this.pageSize = 5;
        this.currentPage = 0;
        this.totalSize = this.existingUnities.length;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      }, this.handleError.bind(this));
    } else {
      return this.apiService.getNewWithoutParent().subscribe((unities: any[]) => {
        this.existingUnities = unities;
        this.dataSource = new MatTableDataSource<Unity>(unities);
        this.pageSize = 5;
        this.currentPage = 0;
        this.totalSize = this.existingUnities.length;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      }, this.handleError.bind(this));
    }
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccess() {
    this.getUnities();
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
  }

  iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.existingUnities.slice(start, end);
    this.dataSource = new MatTableDataSource<any>(part);
  }

  submit() {
    this.dialogRef.close(this.elementsSelected);
  }

  close(): void {
    this.dialogRef.close();
  }

  selectElement(checking, element) {
    const index = this.existingUnities.findIndex(e => e._id === element._id);
    this.existingUnities[index].selected = (checking) ? true : false;
    this.elementSelected = (checking) ? element : null;
    if (checking) this.elementsSelected.push(element)
    else this.elementsSelected = this.elementsSelected.filter(e => e._id !== element._id);
  }

  unselectElement(element) {
    const index = this.existingUnities.findIndex(e => e._id === element._id);
    this.existingUnities[index].selected = false;
    this.elementsSelected = this.elementsSelected.filter(e => e._id !== element._id);
    if (!this.multiple) this.elementSelected = null;
  }

  isSelected(element): boolean {
    const index = this.existingUnities.findIndex(e => e._id === element._id);
    return this.existingUnities[index].selected;
  }

  formatContent(text: string): string {
    if (text.length <= 110) return text;
    const limit = text.substr(0, 110).lastIndexOf(' ');
    return `  ${text.substr(0, limit)}... `;
  }

  textToggle(element) {
    element.isTextToggled = !element.isTextToggled;
  }

}
