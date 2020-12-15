import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminTypeformSurveysComponent } from './pages/admin-typeform-surveys/admin-typeform-surveys.component';
import { AdminTypeformSurveysFormComponent } from './pages/admin-typeform-surveys-form/admin-typeform-surveys-form.component';
import { AdminCustomSurveysComponent } from './pages/admin-custom-surveys/admin-custom-surveys.component';
import { AdminCustomSurveysFormComponent } from './pages/admin-custom-surveys-form/admin-custom-surveys-form.component';
import { AdminCustomSurveysBlockFormComponent } from './pages/admin-custom-surveys-block-form/admin-custom-surveys-block-form.component';
import { CanDeactivateGuard } from '../shared/services/canDeactivate.guard';

const routes: Routes = [
  { path: 'typeform', component: AdminTypeformSurveysComponent },
  { path: 'typeform/add', component: AdminTypeformSurveysFormComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'typeform/edit/:survey', component: AdminTypeformSurveysFormComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'personalizados', component: AdminCustomSurveysComponent },
  { path: 'personalizados/add', component: AdminCustomSurveysFormComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'personalizados/edit/:survey', component: AdminCustomSurveysFormComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'personalizados/edit/:survey/bloque/add', component: AdminCustomSurveysBlockFormComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'personalizados/edit/:survey/bloque/edit/:block', component: AdminCustomSurveysBlockFormComponent, canDeactivate: [CanDeactivateGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminSurveysRoutingModule { }