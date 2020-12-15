import { Component, Inject, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { TranslateService } from '@ngx-translate/core';




@Component({
  selector: 'app-link-announcement-modal',
  templateUrl: 'link-announcement-modal.component.html'
})
export class LinkAnnouncementModalComponent {

  loading = false;
  announcements;
  private formGroup: FormGroup;

  selectedAnnouncement = 0;
  flagRadioButton = false;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'select'];
  searchResultsView = false;
  existingPositions = [];
  private readonly logsMessagesKeys: Array<string> = [
    'genericMessages.private',
    'genericMessages.noData',
    'genericMessages.public'
  ]; // Para delete mat chips sin afectar al padre hasta que guarde
  private private: string;
  private public: string;
  private noData: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    public dialogRef: MatDialogRef<LinkAnnouncementModalComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private api: SelectionApiService,
    private translate: TranslateService) {
    this.flagRadioButton = false;
    this.getAnnouncements();
    this.getLogsTranslations();

  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations) => {
        this.private = translations['genericMessages.private'];
        this.public = translations['genericMessages.public'];
        this.noData = translations['genericMessages.noData'];
      });
  }

  close(data?): void {
    this.dialogRef.close(data);
  }

  save() {
    if (this.selectedAnnouncement !== 0) this.close(this.selectedAnnouncement);
  }

  getAnnouncements() {
    this.api.getAnnouncements({}).subscribe(
      (data: any) => {
        if (data) {
          this.announcements = data;
          this.dataSource = new MatTableDataSource<any>(this.announcements);

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        }
      });
  }

  linkAnnouncementToOffer(element) {
    this.flagRadioButton = true;
    this.selectedAnnouncement = element;
  }


}
