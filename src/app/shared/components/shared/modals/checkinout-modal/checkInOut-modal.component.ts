import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { EventService } from '../../../../../shared/services//event.service';

import { ApiService } from '../../../../../shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';


@Component({
  templateUrl: './checkInOut-modal.component.html',
  styleUrls: ['./checkInOut-modal.component.scss']
})
export class CheckInOutModalComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  loading: boolean = false;
  lastCheck: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  comentarioFichaje: string = '';
  imIn: boolean;

  constructor(
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<CheckInOutModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private apiService: ApiService,
    private eventService: EventService,
    private logsService: LogsService,
    private userService: UserService,
    private translate: TranslateService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.setIfImIn();
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'checkInOut-modal', employee: user, userAgent: window.navigator.userAgent }).subscribe();
    this.translationsKeys = [
      'logsMessages.checkInOut.entrySuccess',
      'logsMessages.checkInOut.exitSuccess',
      'logsMessages.checkInOut.checkInError'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  checkInOut(value) {
    this.apiService.checkInOut(value, this.comentarioFichaje).subscribe((data: any) => {
      this.dialogRef.close();
      if (value === '1') {
        this.logsService.log(this.translations['logsMessages.checkInOut.entrySuccess']);
      } else {
        this.logsService.log(this.translations['logsMessages.checkInOut.exitSuccess'], 'toast-ok-blue');
      }
      this.eventService.newCheckInOut.emit();
    }, error => {
      this.dialogRef.close();
      this.logsService.logError(this.translations['logsMessages.checkInOut.checkInError']);
    });
  }

  setIfImIn() {
    this.apiService.getCheckInOutsLastStatus().subscribe(lastStatus => {
      lastStatus && lastStatus.type === '1' ? this.imIn = true : this.imIn = false;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

}
