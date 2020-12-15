import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { PublicApiService } from '../../services/public.api.service';
import { UserService } from 'src/app/shared/services/user.service';


@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html'
})
export class LoadingComponent implements OnInit {

  public userLoaded = false;
  public loggedUrl = '/home';

  constructor(
    private activatedRoute: ActivatedRoute,
    private translationService: TranslationService,
    private router: Router,
    private publicApiService: PublicApiService,
    private userService: UserService,
  ) {
    this.translationService.spinnerActive = false;
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log('params', params);

      if (params.provider) this.chooseProviderAccess(params);

    });
  }


  chooseProviderAccess(profile) {
    switch (profile.provider) {
      case 'GOOGLE':
        this.googleLinkedinAccess(profile);
        break;
      case 'FACEBOOK':
        this.facebookAccess(profile);
        break;
      case 'LINKEDIN':
        this.googleLinkedinAccess(profile);
        break;
      default:
        break;
    }
  }


  googleLinkedinAccess(googleProfile): void {
    this.publicApiService.providerAccess(googleProfile).subscribe(resp => {
      if (resp) {
        this.tokenUserRedirect(resp.token, resp.user, this.loggedUrl);
      }
    });
  }

  tokenUserRedirect(token, user, url) {
    this.router.navigate([url]);
    this.userService.setUser(user);
    this.userService.setToken(token);
  }


  facebookAccess(facebookProfile): void {
    const profile = {};
    Object.keys(facebookProfile).forEach(key => {
      if (facebookProfile[key] !== 'undefined') profile[key] = facebookProfile[key];
    });
    this.publicApiService.providerAccess(profile).subscribe(resp => {
      if (resp) {
        this.tokenUserRedirect(resp.token, resp.user, this.loggedUrl);
      }
    });

  }

}
