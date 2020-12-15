import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SearchModalComponent } from 'src/app/search/search-modal/search-modal.component';
import { CheckInOutModalComponent } from '../../shared/components/shared/modals/checkinout-modal/checkInOut-modal.component';
import { Employee } from '../../shared/models/employee.model';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { TranslationService } from '../../shared/services/translation.service';
import { DateAdapter } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() user: Employee;
  config;
  selectedLang: string;
  availableLangs: any[];
  permissions;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private eventService: EventService,
    private translate: TranslateService,
    public configurationService: ConfigurationService,
    private translationService: TranslationService,
    private dateAdapter: DateAdapter<Date>,
    ) {
  }
  ngOnDestroy(): void {
    this.eventService.unSubscribeObservables();
  }

  ngOnInit() {
    this.config = this.configurationService.getConfiguration();

    this.selectedLang = this.translationService.getCurrentLang();
    if (this.config.services.translations.active) {
      this.availableLangs = this.setAvailableLangs(this.config.services.translations.languages);
      if (!(this.availableLangs.some(lang => lang === this.selectedLang))) {
        this.selectedLang = this.config.services.translations.defaultLanguage;
      }
    }

    const subscription = this.eventService.changePhotoEmitter.subscribe((employee) => {
      this.user = employee;
    });
    this.eventService.setSubscription(subscription);
    this.permissions = this.userService.getPermissions();
  }

  setAvailableLangs(obj) {
    const arr = [];
    for (const [key, value] of Object.entries(obj)) { if (value) arr.push(key); }
    return arr;
  }

  onChangeLang(event, reload = true) {
    const curretnlang = window.sessionStorage.getItem('lang');
    this.translate.resetLang(curretnlang ? curretnlang : 'es');
    window.sessionStorage.setItem('lang', event);
    this.dateAdapter.setLocale(event);
    if (reload) window.location.reload();
  }

  openSearchDialog() {
    const title = 'Búsqueda de usuarios';
    this.dialog.open(SearchModalComponent, { data: { title: title }, autoFocus: false });
  }

  openFichajeDialog() {
    const title = 'Fichar';
    this.dialog.open(CheckInOutModalComponent, { width: '400px', data: { title: title }, autoFocus: false });
  }

  logout() {
    this.userService.logOut();
    this.router.navigate(['/public/login']);
  }
}
