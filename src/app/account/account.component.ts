import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { ConfigurationService } from '../shared/services/configuration.service';
import { LogsService } from '../shared/services/shared-services/logs.service';
import { CustomValidators } from '../shared/validators/custom-validators';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { UserService } from '../shared/services/user.service';
import { Surveys, Survey } from '../shared/models/survey.model';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesAccount } from '../shared/models/logsMessages.interface';
import { ComponentCanDeactivate } from '../shared/services/canDeactivate.guard';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})


export class AccountComponent implements OnInit, ComponentCanDeactivate {

  private accountForm: FormGroup;
  private passwordsNoMatch = true;
  private passwordConfirmed = false;
  private hideOldPassword = true;
  private hideNewPassword = true;
  private hideConfirmPassword = true;
  private logsMessagesTranslations: LogsMessagesAccount;

  config: any;
  public showPendingSurveys: boolean;
  public surveys: Array<Survey>;
  isModified = false;

  constructor(
    private logsService: LogsService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public configurationService: ConfigurationService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private translateService: TranslateService
  ) {
    this.checkPendingSurveys();
  }

  ngOnInit() {
    this.config = this.configurationService.getConfiguration();
    this.getLogsTranslations();

    if (this.config.services.account.services.changePassword) this.createAccountForm();
    this.showPendingSurveys = this.config.services.surveys;
    const user = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'personalAccount', employee: user, userAgent: window.navigator.userAgent }).subscribe();
  }

  getLogsTranslations(): void {

    this.translateService.get([
      'logsMessages.account.passwordChange',
      'logsMessages.account.wrongPassword',
      'logsMessages.account.passwordMustMacht'])
      .subscribe((translations: LogsMessagesAccount) => {
        this.logsMessagesTranslations = translations;
      });
  }

  createAccountForm(): void {
    this.accountForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      oldPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(4)]]
    },
      {
        validator: CustomValidators.MatchPassword
      });
  }

  changePassword(): void {
    const data = this.accountForm.getRawValue();
    this.passwordConfirmed = true;
    if (data.newPassword === data.confirmPassword) {
      this.apiService.changePassword(data).subscribe(res => {
        if (res.passwordChangedCorrectly) {
          this.logsService.log(this.logsMessagesTranslations['logsMessages.account.passwordChange']);
          this.accountForm.reset();
          Object.keys(this.accountForm.controls).forEach(key => {
            this.accountForm.get(key).setErrors(null);
          });
          this.isModified = false;
        } else if (res.passwordDoNotMatch) {
          this.logsService.logError(this.logsMessagesTranslations['logsMessages.account.wrongPassword']);
        }
      });
    } else {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.account.passwordMustMacht']);
    }
  }

  checkPendingSurveys() {
    this.apiService.getPendingSurveys().subscribe((surveys: Surveys) => {
      this.surveys = surveys.pendingSurveys;
    });
  }

  changeVisibilityPassword(e: Event, s: string) {
    e.preventDefault();
    switch (s) {
      case 'hideOldPassword': {
        this.hideOldPassword = !this.hideOldPassword;
        break;
      }
      case 'hideNewPassword': {
        this.hideNewPassword = !this.hideNewPassword;
        break;
      }
      default:{
        this.hideConfirmPassword = !this.hideConfirmPassword;
        break;
      }
    }
  }
  onChange(){
    this.isModified = true;
  }

  canDeactivate() {
    return !this.isModified;
  }
}