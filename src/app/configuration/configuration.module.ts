import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ConfigurationService } from '../shared/services/configuration.service';


const initialize = (appConfigService: ConfigurationService) => {
    return () => appConfigService.load();
};

@NgModule({
    imports: [HttpClientModule],
    providers: [
        ConfigurationService,
        { provide: APP_INITIALIZER, useFactory: initialize, deps: [ConfigurationService], multi: true }
    ],
})
export class ConfigurationModule { }
