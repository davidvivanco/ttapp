import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvatarRoutingModule } from './avatarmodule-routing.module';
import { AvatarComponent } from './avatar.component';

@NgModule({
  declarations: [
    AvatarComponent
  ],
  imports: [
    CommonModule,
    AvatarRoutingModule
  ],
  exports: [
    AvatarComponent
  ]
})

export class AvatarModule { }
