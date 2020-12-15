import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { UserService } from '../../../shared/services/user.service';
import { Employee } from '../../../shared/models/employee.model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CommonFunctions } from '../../../commonFunctions';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AnalyticsService } from 'src/app/shared/services/shared-services/analytics.service';
import { environment } from 'src/environments/environment';
import { ModalRegisterComponent } from 'src/app/public-module/pages/job-portal/modals/modal-register/modal-register.component';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon, LogsMessagesOffers } from 'src/app/shared/models/logsMessages.interface';
import { ModalTranslationsCommon, ModalTranslationsOffers } from 'src/app/shared/models/modalTranslation.interface';
import { AuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { PublicApiService } from '../../services/public.api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public environment: ConfigurationCompany;
  public hide = true;
  public loginForm: FormGroup;
  public changePasswordForm: FormGroup;
  public loggedUrl: string;
  public queryParams: any;
  public companies;
  public recovery: boolean;
  public token: string;
  private url = environment.url;
  public resources = environment.resources;
  linkedInImage: string;
  facebookImage: string;
  googleImage: string;
  canSeeSocialLogin: boolean;
  @Input() modalFlag = false;
  @Input() dialogRef: any;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonFunctions: CommonFunctions,
    private configurationService: ConfigurationService,
    private logsService: LogsService,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private publicApiService: PublicApiService,
  ) {
    this.environment = this.configurationService.getConfiguration();
  }

  ngOnInit() {
    this.apiService.getLoginCompanies().subscribe(res => {
      this.companies = res;
      this.linkedInImage = this.getLinkedInLogo();
      this.facebookImage = this.getFacebookLogo();
      this.googleImage = this.getGoogleLogo();
    });

    this.checkSocialLoginServices(this.environment);
    // si vengo de una url que necesita login, me la guardo para redirigir ahí en cuanto haga el login
    this.route.queryParams.subscribe(params => {
      this.loggedUrl = (this.modalFlag) ? ('/seleccion/ofertas') : (params['returnUrl'] || '/home');
      this.queryParams = Object.assign({}, params);
      delete this.queryParams['returnUrl'];


      if (params.recovery) {
        this.recovery = true;
        this.token = params.token;
        this.createChangePasswordForm();
      }
    });
    this.loginForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    if (this.environment.company.multiCompany) {
      this.loginForm.addControl('companyId', new FormControl('', [Validators.required]));
    }
    this.translationsKeys = [
      'logsMessages.account.passwordChange',
      'logsMessages.account.passwordMustMacht',
      'logsMessages.account.cantChangePassword'
    ];
    this.getTranslations();
  }



  doLogin() {
    const aux = this.loginForm.getRawValue();
    let data;
    if (this.environment.company.multiCompany) {
      data = {
        id: aux.companyId + this.commonFunctions.fillUserId(aux.id),
        password: aux.password
      };
    } else {
      data = {
        id: aux.id,
        password: aux.password
      };
    }
    this.apiService.login(data).subscribe(res => {

      const user = { ...res.user, ...new Employee(res.user) };
      this.tokenUserRedirect(res.token, user, this.loggedUrl, this.queryParams);
    });
  }

  signInWithLinkedIn(e: Event) {
    e.preventDefault();
    window.top.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86ghx8v2kk2zeo&redirect_uri=${this.url}public/loading&scope=r_liteprofile%20r_emailaddress`;
  }

  redirectToTalentSolutions(provider) {
    window.top.location.href = `${environment.apiTalentSolutionsUrl}/login/auth/${provider}?redirectTo=${environment.url}`;
  }

  checkSocialLoginServices(env) {
    this.canSeeSocialLogin = (env.services.linkedinAccess || env.services.facebookAccess || env.services.googleAccess) ? true : false;
  }
  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesOffers & LogsMessagesCommon & ModalTranslationsCommon & ModalTranslationsOffers) => {
        this.translations = translations;
      });
  }

  getLinkedInLogo(): string {
    return `${this.resources}images/linkedin-logo.png`;
  }

  getFacebookLogo(): string {
    return `${this.resources}images/facebook-logo.png`;
  }

  getGoogleLogo(): string {
    return `${this.resources}images/google-logo.png`;
  }

  createChangePasswordForm() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      renewPassword: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  tokenUserRedirect(token, user, url, qp) {
    this.router.navigate([url], { queryParams: qp });
    this.userService.setUser(user);
    this.userService.setToken(token);
  }

  changePassword() {
    const data = this.changePasswordForm.getRawValue();
    data.token = this.token;
    if (data.newPassword === data.renewPassword) {
      this.apiService.changePasswordAfterRecoveryEmail(data).subscribe(res => {
        if (res) {
          this.logsService.log(this.translations['logsMessages.account.passwordChange']);
          this.recovery = false;
        }
      }, () => {
        this.logsService.logError(this.translations['logsMessages.account.cantChangePassword']);
      });
    } else {
      this.logsService.logError(this.translations['logsMessages.account.passwordMustMacht']);
    }
  }

  openRecoveryPassword() {
    this.dialog.open(RecoveryPasswordModalComponent, { autoFocus: false });
  }

  openRegisterModal() {
    this.dialogRef.close();
    this.dialog.open(ModalRegisterComponent, {
      width: '400px'
    });
  }

}

// modal de recuperacion de contraseña
@Component({
  templateUrl: './recovery-password-modal.component.html',
  styleUrls: ['./login.component.scss']
})
export class RecoveryPasswordModalComponent implements OnInit {
  recoveryForm: FormGroup;
  recoverySended = false;

  constructor(public dialogRef: MatDialogRef<RecoveryPasswordModalComponent>, private formBuilder: FormBuilder, private apiService: ApiService) {
  }

  ngOnInit() {
    this.createLoginForm();
  }

  createLoginForm() {
    this.recoveryForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }


  sendEmail() {
    this.apiService.recoveryPassword({ email: this.recoveryForm.get('email').value }).subscribe(res => {
      if (res) {
        this.recoverySended = !this.recoverySended;
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}

