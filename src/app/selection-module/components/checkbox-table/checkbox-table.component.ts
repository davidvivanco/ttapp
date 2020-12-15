import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

interface Selects {
  controlName: string;
  control: FormControl;
  title: string;
  valueSelected: Array<string>;
  options: Array<
    {
      disabled: boolean,
      value: string,
      label: string
    }
  >;
}

@Component({
  selector: 'app-checkbox-table',
  templateUrl: './checkbox-table.component.html',
  styleUrls: ['./checkbox-table.component.scss']
})
export class CheckboxTableComponent implements OnInit {

  @Input() elements: Array<any>;
  @Input() modal: string;
  @Input() title: string;
  @Input() displayedColumns: string[];
  @Input() multiple: boolean;
  @Input() selects: Array<Partial<Selects>>;
  @Input() set selectElementManually(arg) {
    this.disabled = false;
    if (arg) {
      this.disabled = true;
      this.selectElement(arg.checking, arg.element);
    }
  }
  @Output() onClose: EventEmitter<true>;
  @Output() onSubmit: EventEmitter<any>;
  @Output() onCancel: EventEmitter<any>;

  allFieldsDisabled: boolean;
  elementSelected: any;
  elementsSelected: Array<any>;
  search: string;
  disabled = false;
  globalFilter: FormControl;
  dataSource = new MatTableDataSource<any>([]);
  isTextToggled: boolean;
  public pageSize = 5;
  public currentPage = 0;
  public totalSize = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor() {
    this.onClose = new EventEmitter();
    this.onCancel = new EventEmitter();
    this.onSubmit = new EventEmitter();
    this.selects = [];
    this.globalFilter = new FormControl('', [Validators.required
    ]);
    this.elementsSelected = [];
    this.isTextToggled = false;

    this.globalFilter.valueChanges
      .subscribe(
        str => {
          this.currentPage = 0;
          if (!str) {
            this.dataSource = new MatTableDataSource<any>(this.elements.slice(0, 5));
            this.pageSize = 5;
            this.totalSize = this.elements.length;
          }
          this.search = str.trim().toLowerCase();
          const searched = this.elements.filter(r => r[(r.title) ? 'title' : 'name'].toLowerCase().indexOf(this.search) >= 0);
          this.dataSource = new MatTableDataSource<any>(searched.slice(0, this.pageSize));
          this.totalSize = searched.length;
        }
      );

  }

  ngOnInit() {
    if (this.selects.length) {
      for (const select of this.selects) {
        select.control = new FormControl(select.valueSelected);
      }
    }
    this.dataSource = new MatTableDataSource<any>(this.elements.slice(0, 5));
    this.pageSize = 5;
    this.currentPage = 0;
    this.totalSize = this.elements.length;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
  }

  iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.elements.slice(start, end);
    this.dataSource = new MatTableDataSource<any>(part);
  }

  selectionChange(e, index: number) {
    this.selects[index].valueSelected = e.value.map(item => item);
  }

  submit() {
    this.onSubmit.emit((this.multiple) ? this.elementsSelected : this.elementSelected);
  }

  close(): void {
    this.onClose.emit(true);
  }

  cancel() {
    this.onCancel.emit(true);
  }

  selectElement(checking, element) {
    const index = this.elements.findIndex(e => e._id === element._id);
    this.elements[index].selected = (checking) ? true : false;
    this.elementSelected = (checking) ? element : null;
    if (checking) this.elementsSelected.push(element)
    else this.elementsSelected = this.elementsSelected.filter(e => e._id !== element._id);
  }

  unselectElement(element) {
    const index = this.elements.findIndex(e => e._id === element._id);
    this.elements[index].selected = false;
    this.elementsSelected = this.elementsSelected.filter(e => e._id !== element._id);
    if (!this.multiple) this.elementSelected = null;

  }

  isSelected(element): boolean {
    const index = this.elements.findIndex(e => e._id === element._id);
    return this.elements[index].selected;
  }

  formatContent(text: string): string {
    if (text.length <= 110) return text;
    const limit = text.substr(0, 110).lastIndexOf(' ');
    return `  ${text.substr(0, limit)}... `;
  }

  textToggle(element) {
    element.isTextToggled = !element.isTextToggled;
  }

  clickInAllFields(option, index) {
    if (option.selected) {
      this.selects[index].options.forEach(o => o.disabled = true);
      this.selects[index].valueSelected = this.selects[index].options.map(i => i.value);
      this.selects[index].control.setValue(['all']);

    } else {
      this.selects[index].options.forEach(o => o.disabled = false);
      this.selects[index].valueSelected = [];
      this.selects[index].control.setValue([])
    }
  }


  checkAllControls() {
    for (const select of this.selects) {
      if (select.control.hasError('required')) return false;
      if (select.control.untouched) return false;
      if (Array.isArray(select.valueSelected) && select.valueSelected.length === 0) return false;
    }
    return true;
  }

  getAllFieldValues(select: Selects): Array<string> {
    return select.options.map(e => e.value);
  }

}
