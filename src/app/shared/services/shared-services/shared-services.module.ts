import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { LogsService } from './logs.service';
import { ErrorsService } from './errors.service';
import { AnalyticsService } from './analytics.service';
import { QuicklinkModule } from 'ngx-quicklink';

@NgModule({
  imports: [
    QuicklinkModule
  ],
  exports: [
    QuicklinkModule
  ],
})

export class SharedModule {

  constructor (@Optional() @SkipSelf() parentModule?: SharedModule) {
    if (parentModule) {
      throw new Error(
        'SharedModule is already loaded. Import it in the AppModule only');
    }
  }
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
          LogsService,
          ErrorsService,
          AnalyticsService
        ]
    };
  }

}
