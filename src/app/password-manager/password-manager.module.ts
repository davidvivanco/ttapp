import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PasswordManagerRoutingModule } from './password-manager-routing.module';
import { AccessComponent } from './access/access.component';
import { MatIconModule } from '@angular/material';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';

@NgModule({
  declarations: [AccessComponent],
  imports: [
  CommonModule,
    PasswordManagerRoutingModule,
    BreadcrumbModule,
    // MATERIAL
    MatIconModule
  ]
})
export class PasswordManagerModule {
  constructor() {
    sessionStorage.setItem('SameSite', 'lax');
  }
}
