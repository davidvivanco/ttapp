import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, Sort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SearchModalUnitiesComponent } from '../search/search-modal-unities/search-modal-unities.component';
import { DeleteConfirmationModalComponent } from '../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { LogsMessagesCommon } from '../shared/models/logsMessages.interface';
import { ApiService } from '../shared/services/api.service';
import { LogsService } from '../shared/services/shared-services/logs.service';
import { ViewModalComponent } from './view-modal/view-modal.component';

@Component({
  selector: 'app-media-manager',
  templateUrl: './media-manager.component.html',
  styleUrls: ['./media-manager.component.scss']
})
export class MediaManagerComponent implements OnInit {
  selectedColumn = [
    { name: 'title', order: 'asc', icon: 'arrow_upward' },
    { name: 'title', order: 'desc', icon: 'arrow_downward' },
    { name: 'uploadedAt', order: 'asc', icon: 'arrow_upward' },
    { name: 'uploadedAt', order: 'desc', icon: 'arrow_downward' }
  ];
  selectedOption;
  fmGeneric: any;
  fmTranslations: any;

  public loading = false;
  files = [];

  searchStr: String;
  currentPage = 0;
  sort = -1;
  limit = 20;
  sortField = 'uploadedAt';
  totalFiles: Number;
  count = true;

  breakpoint: number;

  imgType = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg'];
  docType = ['txt', 'doc', 'docx', 'docm', 'odt', 'ppt', 'pps', 'ppsm', 'pptm', 'odp', 'xls', 'xlsx', 'xlsm', 'ods'];
  pdfType = ['pdf'];
  videoType = ['avi', 'divx', 'mov', 'mp4', 'mpg', 'mkv', 'wmv'];
  audioType = ['mp3', 'wma', 'wav', 'flac', 'midi', 'ogg'];

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    public apiService: ApiService,
    private logsService: LogsService,
  ) { }

  ngOnInit() {
    this.breakpoint = window.innerWidth <= 768 ? 2 : 5;
    this.getTranslations();
    this.getFiles();
  }

  getFiles() {
    this.loading = true;
    this.apiService.getAllFiles(this.currentPage, this.sort, this.limit, this.sortField, this.count, this.searchStr).subscribe(res => {
      this.totalFiles = res.total;
      this.files = res.pagination;
      this.loading = false;
    });
  }

  getTranslations(): void {
    this.translate.get('genericMessages').subscribe((text: string) => {
      if (text) this.fmGeneric = text;
      this.populateSortArr(this.selectedColumn);
    });
    this.translate.get('filesManager').subscribe((text: string) => {
      if (text) this.fmTranslations = text;
    });
  }

  populateSortArr(arr) {
    arr[0].title = this.fmGeneric.name + ' (A-Z)';
    arr[1].title = this.fmGeneric.name + ' (Z-A)';
    arr[2].title = this.fmGeneric.olderM;
    arr[3].title = this.fmGeneric.newer;
  }

  openSearchModal() {
    const title = this.fmTranslations.search;
    const description = this.fmGeneric.searchByName;
    const dialog = this.dialog.open(SearchModalUnitiesComponent, { data: { title: title, description: description }, autoFocus: false });

    dialog.afterClosed().subscribe(((searchStr: string) => {
      if (searchStr) {
        this.paginator.pageIndex = 0;
        this.currentPage = this.paginator.pageIndex;
        this.searchStr = searchStr.trim().toLowerCase();
        this.getFiles();
      }
    }));
  }

  changeSortedColumn(evt) {
    this.sortField = evt.value.name;
    (evt.value.order === 'asc') ? this.sort = 1 : this.sort = -1;
    this.getFiles();
  }

  openViewModal(file?) {
    const type = this.checkFileType(file);
    const dialogRef = this.dialog.open(ViewModalComponent, {
      // panelClass: 'full-width-dialog', // TODO tamaño de la modal
      data: { element: file, type: type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(result, false);
      }
    });
  }

  checkFileType(element) {
    const file = element.fullPath.split('.');
    const ext = file[file.length - 1].toLowerCase();

    if (this.imgType.includes(ext)) {
      return 'image';
    } else if (this.videoType.includes(ext)) {
      return 'video';
    } else if (this.audioType.includes(ext)) {
      return 'audio';
    } else if (this.docType.includes(ext)) {
      return 'doc';
    } else if (this.pdfType.includes(ext)) {
      return 'pdf';
    } else {
      return 'unknown';
    }

    return false;
  }

  getData(evt) {
    this.currentPage = evt.pageIndex;
    this.getFiles();
  }

  delete(element, launchConf = true) {
    if (launchConf) {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
        data: {
          title: this.fmGeneric.delete,
          message: this.fmGeneric.deleteConfirmation
        }
      });

      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.loading = true;
          this.apiService.deleteFile(element._id).subscribe((res) => {
            this.getFiles();
            this.loading = false;
            this.handleSuccess();
          }), this.handleError.bind(this);
        }
      });
    } else {
      this.loading = true;
      this.apiService.deleteFile(element._id).subscribe((res) => {
        this.getFiles();
        this.loading = false;
        this.handleSuccess();
      }), this.handleError.bind(this);
    }
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.fmTranslations.tsLiterals.errorDelete);
  }

  handleSuccess() {
    this.logsService.log(this.fmTranslations.tsLiterals.succesDelete);
  }

  backToAll() {
    this.searchStr = '';
    this.getFiles();
  }

  onResize(event) {
    this.breakpoint = event.target.innerWidth <= 768 ? 2 : 5;
  }
}
