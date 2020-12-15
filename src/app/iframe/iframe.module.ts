import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IframeRoutingModule } from './iframe-routing.module';
import { IframeComponent } from './iframe.component';
import { MatIconModule } from '@angular/material';
import { BreadcrumbModule } from './../shared/modules/breadcrumb/breadcrumbmodule.module';


@NgModule({
  declarations: [IframeComponent],
  imports: [
  CommonModule,
    IframeRoutingModule,
    // MATERIAL
    MatIconModule,
    BreadcrumbModule
  ],
  providers: [
    
  ]
})
export class IframeModule {
  constructor() {}
}
