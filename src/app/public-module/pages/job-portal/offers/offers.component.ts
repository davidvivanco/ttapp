import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectionApiService } from 'src/app/selection-module/services/selection.api.services';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html'
})
export class OffersComponent implements OnInit {
  idAnnouncement: string;
  public announcement: any;
  breadcrumbList = '';
  showView: boolean;

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: any;

  constructor(
    private route: ActivatedRoute,
    private api: SelectionApiService,
    private translate: TranslateService,
    private logsService: LogsService
  ) {
    this.idAnnouncement = this.route.snapshot.paramMap.get('id');
    if (this.idAnnouncement) {
      this.api.getAnnouncementById(this.idAnnouncement).subscribe((data: any) => {
        this.announcement = data.announcement;
        this.showView = true;
        this.breadcrumbString();
      },
        () => this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']));
    } else {
      this.api.getPublicOffersByVisibility({}).subscribe((data: any) => {
        this.showView = true;
        this.breadcrumbString();
      },
        () => this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.errorOccurred']));
    }
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.announcements',
      'selection.announcements.offersBy',
      'genericMessages.offers',
      'jobWebsite.breadCrumb.talentoo',
      'jobWebsite.breadCrumb.jobWebsite',
      'logsMessages.common.errorOccurred'
    ];
    this.getLogsTranslations();
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: any) => {
        this.logsMessagesTranslations = translations;
        this.createBreadCrumbList();
      });
  }

  createBreadCrumbList() {
    this.breadcrumbList = this.breadcrumbList.concat(this.logsMessagesTranslations['jobWebsite.breadCrumb.talentoo'], ',', this.logsMessagesTranslations['jobWebsite.breadCrumb.jobWebsite']);
  }

  breadcrumbString() {
    if (this.announcement && this.announcement.title && this.idAnnouncement) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.announcements'], ',',
        this.logsMessagesTranslations['selection.announcements.offersBy'], ' ', this.announcement.title);
    }
    if (!this.idAnnouncement) {
      this.breadcrumbList = this.breadcrumbList.concat(',', this.logsMessagesTranslations['genericMessages.offers']);
    }
  }

}
