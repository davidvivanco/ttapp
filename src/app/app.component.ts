import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { UserService } from './shared/services/user.service';
import { ConfigurationService } from './shared/services/configuration.service';
import { Title } from '@angular/platform-browser';
import { TranslationService } from './shared/services/translation.service';

import { EventService } from './shared/services/event.service';
import { ApiService } from './shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  constructor(
    private userService: UserService,
    private renderer: Renderer2,
    public configurationService: ConfigurationService,
    private titleService: Title,
    private eventService: EventService,
    private apiService: ApiService,
    private logsService: LogsService,
    public translationService: TranslationService,
    public router: Router) {
    this.titleService.setTitle('' + this.configurationService.getConfiguration().company.publicName);
    this.userService.getUser();

    if (environment.googleAnalyticsId) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', environment.googleAnalyticsId,
            {
              'page_path': event.urlAfterRedirects
            }
          );
        }
      });
    }
  }
  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  ngOnInit(): void {
    this.changeTemplate(this.configurationService.getConfiguration().company);
    const notificationSubscription = this.eventService.notification.subscribe((notificationData) => {
      if (notificationData && notificationData.type === '_200') {
        this.logsService.log(notificationData.message);
      }
      if (notificationData && notificationData.type === '_500') {
        this.logsService.logError(notificationData.message);
      }
    });
    this.eventService.setSubscription(notificationSubscription);
  }

  changeTemplate(company) {
    let value = this.userService.changeTemplate(company);
    const e: HTMLStyleElement = document.getElementsByTagName('style')[0];
    value += e.textContent;
    this.renderer.setProperty(e, 'textContent', value);
  }

}
