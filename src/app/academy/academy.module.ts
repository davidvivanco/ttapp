import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcademyRoutingModule } from './academy-routing.module';
import { AccessComponent } from './pages/access/access.component';
import { MatIconModule } from '@angular/material';
import { AcademyApiService } from './services/academy.api.services';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';


@NgModule({
  declarations: [AccessComponent],
  imports: [
    CommonModule,
    AcademyRoutingModule,
    // MATERIAL
    MatIconModule,
    BreadcrumbModule
  ],
  providers: [
    AcademyApiService
  ]
})
export class AcademyModule {
  constructor() {
    sessionStorage.setItem('SameSite', 'lax');
  }
}
