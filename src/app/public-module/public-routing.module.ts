import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoadingComponent } from './pages/loading/loading.component';
import { JobPortalComponent } from './pages/job-portal/job-portal.component';
import { AnnouncementsComponent } from './pages/job-portal/announcements/announcements.component';
import { OffersComponent } from './pages/job-portal/offers/offers.component';
// import { LoginComponent } from './components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'loading', component: LoadingComponent },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'portal-de-empleo', component: JobPortalComponent, children: [
      { path: '', component: AnnouncementsComponent },
      { path: 'convocatorias', component: AnnouncementsComponent },
      { path: 'convocatorias/ofertas/:id', component: OffersComponent },
      { path: 'ofertas/:id', component: OffersComponent },
      { path: 'ofertas', component: OffersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
