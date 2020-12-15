import { NgModule } from '@angular/core';
import { CommonModule as Common } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PageTemplateComponent } from './components/page-template/page-template.component';

import { MatIconModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../shared/services/authInterceptor';
import { NotifyService } from './services/notify.service';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';

@NgModule({
  declarations: [PageTemplateComponent],
  imports: [
  Common,
    HttpClientModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    BreadcrumbModule
  ],
  exports: [
    Common,
    HttpClientModule,
    PageTemplateComponent,
    FlexLayoutModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    NotifyService
  ]
})
export class CommonModule { }
