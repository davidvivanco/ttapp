import { Component, HostListener, OnInit } from '@angular/core';
import { AcademyApiService } from '../../services/academy.api.services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Employee } from 'src/app/shared/models/employee.model';
import { UserService } from 'src/app/shared/services/user.service';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { Config } from 'protractor';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html'
})
export class AccessComponent implements OnInit {
  urlAcademy: string;
  urlAcademySafe: SafeResourceUrl;
  finishLoading: boolean;
  user: Employee;
  config: Config;
  urlEvent;
  urlIframe = false;
  checkParams: any;
  @HostListener('window:message', ['$event']) onMessage(event) {
    this.receiveMessage(event);
    if (event.data.logged && this.checkParams.urlIframe) this.redirectIframe(); // redirige cuando haya iniciado sesión y cuando se le pasan parámetros url
  }
  constructor(
    private apiService: AcademyApiService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    public configurationService: ConfigurationService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.user = this.userService.getUser();
    let email = this.user.personalData.email.personal[0] || this.user.personalData.email.professional[0];

    if (!environment.production) email = 'talentoo-desarrollo-pruebas@talenttools.es';

    const password = this.generatePassword(email);

    this.checkParams = this.route.snapshot.queryParams;
    if (!this.urlAcademy) this.urlAcademy = '';
    this.urlAcademy = 'https://app.kolete.es/login-custom?tokenTT=';
    this.config = this.configurationService.getConfiguration();

    this.apiService.loginBlog(email, password).subscribe((data: any) => {
      if (!data || !data.results || !data.results.status) {
        this.apiService.registerBlog(email, password).subscribe((res: any) => { });
        // console.log('finishloading');
        this.finishLoading = true;
      }
    });

    this.apiService.login(email, password).subscribe((data2: any) => {
      this.navigateFlagHelper(data2);
    }, error => {
      this.apiService.register(email, password).subscribe((data3: any) => {
        this.navigateFlagHelper(data3);
      }, error2 => { });
    });
  }

  ngOnInit() {
  }

  navigateFlagHelper(data) { // si tiene params inicia sesión luego redirige a la ruta de los parámetros
    this.urlAcademy += data.user.tokenTT + '&embed=true&lang=' + window.sessionStorage.getItem('lang') + '&primaryColor=' + this.config.company.primaryColor.substr(1) + '&secondaryColor=' + this.config.company.secondaryColor.substr(1);
    this.urlAcademySafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlAcademy);
    this.finishLoading = true;
  }

  redirectIframe() {
    this.finishLoading = false;
    this.router.navigate( // actualizar parámetros sin refrescar página
      [],
      {
        relativeTo: this.route,
        queryParams: { urlIframe: this.checkParams.urlIframe },
        queryParamsHandling: 'merge'
      });
    this.urlAcademy = `https://app.kolete.es/${this.checkParams.urlIframe}?embed=true&url=${this.checkParams.urlIframe}`;
    this.urlAcademySafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlAcademy);
    this.finishLoading = true;
  }

  generatePassword(data) {
    let password = data.length;
    password += password * 1500000;
    return password.toString();
  }

  receiveMessage(event: any) {
    this.urlEvent = event.data.urlIframe;
    this.router.navigate( // actualizar parámetros sin refrescar página
      [],
      {
        relativeTo: this.route,
        queryParams: { urlIframe: event.data.url },
        queryParamsHandling: 'merge'
      });
  }

}
