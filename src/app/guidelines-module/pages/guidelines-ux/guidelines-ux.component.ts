import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { LogsService } from '../../../shared/services/shared-services/logs.service';
import { ModalsComponent } from '../../modals/modals.component';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';

@Component({
  selector: 'app-guidelines-ux',
  templateUrl: './guidelines-ux.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesUxComponent implements OnInit, AfterViewChecked {

  showNotifBadge = false;
  fragment: any;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;

  constructor(
    private logsService: LogsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });

    this.translationsKeys = [
      'genericMessages.dropModal',
      'genericMessages.deleteConfirmation',
      'genericMessages.yes',
      'logsMessages.common.actionSuccess',
      'logsMessages.common.returnError',
      'logsMessages.common.dialog'
    ];
    this.getTranslations();
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  ngAfterViewChecked(): void {
    try {
        if(this.fragment) {
            document.querySelector('#' + this.fragment).scrollIntoView();
        }
    } catch (e) { }
  }

  deleteItem() {
    const info = {
      title: this.translations['genericMessages.dropModal'],
      description: this.translations['genericMessages.deleteConfirmation'],
      actions: this.translations['genericMessages.yes']
    };
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { info }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(this.translations['logsMessages.common.dialog']);
    });
  }

  notification() {
    this.showNotifBadge = true;
    this.logsService.logNotification('Toast de notificación.');
  }

  successToast() {
    this.logsService.log(this.translations['logsMessages.common.actionSuccess']);
  }

  errorToast() {
    this.logsService.logError(this.translations['logsMessages.common.returnError']);
  }

}
