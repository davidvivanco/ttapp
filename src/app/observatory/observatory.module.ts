import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObservatoryRoutingModule } from './observatory-routing.module';
import { AccessComponent } from './pages/access/access.component';
import { MatIconModule } from '@angular/material';
import { ObservatoryApiService } from './services/observatory.api.services';
import { BreadcrumbModule } from '../shared/modules/breadcrumb/breadcrumbmodule.module';


@NgModule({
  declarations: [AccessComponent],
  imports: [
    CommonModule,
    ObservatoryRoutingModule,
    // MATERIAL
    MatIconModule,
    BreadcrumbModule
  ],
  providers: [
    ObservatoryApiService
  ]
})
export class ObservatoryModule {
  constructor() {
    sessionStorage.setItem('SameSite', 'lax');
  }
}
