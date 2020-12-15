import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbRoutingModule } from './breadcrumbmodule-routing.module';
import { MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        BreadcrumbComponent
    ],
    imports: [
    CommonModule,
        BreadcrumbRoutingModule,
        MatIconModule
    ],
    exports: [
        BreadcrumbComponent,
        TranslateModule
    ]
})

export class BreadcrumbModule { }