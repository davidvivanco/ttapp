import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { CustomValidators } from 'src/app/shared/validators/custom-validators';
import { PublicApiService } from '../../services/public.api.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UserService } from 'src/app/shared/services/user.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { MatDialog } from '@angular/material';
import { ModalLoginComponent } from '../job-portal/modals/modal-login/modal-login.component';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  public registerForm: FormGroup;
  public configuration: ConfigurationCompany;
  public loggedUrl: string;
  public hide = true;

  url = environment.url;
  public resources = environment.resources;
  linkedInImage: string;
  facebookImage: string;
  googleImage: string;
  canSeeSocialLogin: boolean;
  @Input() modalFlag = false;
  @Input() dialogRef: any;
  constructor(
    private formBuilder: FormBuilder,
    private publicApiService: PublicApiService,
    private configurationService: ConfigurationService,
    private router: Router,
    private userService: UserService,
    private logsService: LogsService,
    public dialog: MatDialog,
    private authService: AuthService

  ) {
    this.configuration = this.configurationService.getConfiguration();
    if (!this.configuration.services.publicRegister) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.createRegisterForm();
    this.linkedInImage = this.getLinkedInLogo();
    this.facebookImage = this.getFacebookLogo();
    this.googleImage = this.getGoogleLogo();
    this.checkSocialLoginServices(this.configuration);
  }

  changeVisibilityIcon(e: Event) {
    e.preventDefault();
    this.hide = !this.hide;

  }

  doRegister() {
    const data = {
      name: this.registerForm.value.name,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.newPassword,
    };
    this.publicApiService.registerUser(data).subscribe(res => {
      if (res.token) {
        this.tokenUserRedirect(res.token, res.user);

      }
    });

  }

  checkSocialLoginServices(env) {
    this.canSeeSocialLogin = (env.services.linkedinAccess || env.services.facebookAccess || env.services.googleAccess) ? true : false;
  }

  tokenUserRedirect(token, user) {
    this.logsService.log('Te has registrado con éxito');
    this.userService.setUser(user);
    this.userService.setToken(token);
    this.router.navigateByUrl('home');
  }

  createRegisterForm(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
      {
        validator: CustomValidators.MatchPassword
      });

  }

  openLoginModal() {
    this.dialogRef.close();
    this.dialog.open(ModalLoginComponent);
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
}
