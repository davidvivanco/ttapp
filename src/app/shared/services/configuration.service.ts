import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationCompany } from '../models/configuration.model';
import { environment } from '../../../environments/environment';


@Injectable()
export class ConfigurationService {
  endpoint = environment.apiUrl + 'api';
  private configurationCompany: ConfigurationCompany;

  constructor(private http: HttpClient) { }


  private getConfigurationFromApi() {
    return this.http.get<any>(`${this.endpoint}/configuration`);
  }

  public load(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getConfigurationFromApi().subscribe((configuration: any) => {
        this.configurationCompany = configuration;
        if (!environment.production) {
          // Seteamos todo a true para desarrollo
          const services = Object.keys(this.configurationCompany['services']);
          const cardPosition = Object.keys(this.configurationCompany['cardPosition']);
          this.setDevelopeMode(services, 'services');
          this.setDevelopeMode(cardPosition, 'cardPosition');
          this.configurationCompany.company.editPersonalData = true;
          this.configurationCompany.company.companyInfo['subscriptions'].type = 'standard';
          // this.configurationCompany.company.companyInfo['modules'].extra.map( module => module.active = true);
        }
        // console.log(this.configurationCompany);
        resolve(true);
        return this.configurationCompany;
      });
    });
  }

  setDevelopeMode(arr, what) { // Ponemos los elementos a true para verlo todo cuando estamos en desarrollo
    arr.map(e => {
      if (typeof this.configurationCompany[what][e] === 'boolean') this.configurationCompany[what][e] = true;
      else {
        // Los que no son boolean tienen un atributo 'active'
        if (e !== 'carnetsAvailable') this.configurationCompany[what][e].active = true;
      }
    });
  }

  public getConfiguration(): ConfigurationCompany {
    return this.configurationCompany;
  }

}
