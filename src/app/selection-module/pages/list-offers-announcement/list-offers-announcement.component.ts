import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionApiService } from '../../services/selection.api.services';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-offers-announcement',
  templateUrl: './list-offers-announcement.component.html'
})
export class ListOffersAnnouncement implements OnInit {
  idAnnouncement: string;
  employeeHasCurriculum: boolean;
  announcement: any;
  showView: boolean;
  breadcrumbList = 'Talentoo';
  hasPosition = false;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private translate: TranslateService) {
    this.idAnnouncement = this.route.snapshot.paramMap.get('id');

    if (this.idAnnouncement) {
      this.api.getAnnouncementById(this.idAnnouncement).subscribe(
        (data: any) => {
          this.announcement = data.announcement;
          this.employeeHasCurriculum = data.employeeHasCurriculum;
          this.showView = true;
        },
        () => console.log('error')
      );
    } else {
      this.api.getOffersByVisibility({}).subscribe(
        (data: any) => {
          this.employeeHasCurriculum = data.employeeHasCurriculum;
          this.showView = true;
        },
        () => console.log('error')
      );
    }

  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.announcements',
      'selection.announcements.offersBy',
      'genericMessages.offers'
    ];
    this.getLogsTranslations();

  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
        this.breadcrumbString();
      });
  }
  breadcrumbString() {
    if (this.idAnnouncement) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.announcements']);
    }
    if (this.announcement && this.announcement.title && this.idAnnouncement) {
      this.breadcrumbList = this.breadcrumbList.concat(',',
        this.logsMessagesTranslations['selection.announcements.offersBy'], ' ', this.announcement.title);
    }
    if (!this.idAnnouncement) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.offers']);
    }
    if(this.hasPosition) this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.offers']);
  }
  goBack() {
    this.router.navigate(['seleccion/suscripciones']);
  }

  hasPositionId(bool) {
    this.hasPosition = bool;
  }
}
