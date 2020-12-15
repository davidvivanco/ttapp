import { SafeResourceUrl } from '@angular/platform-browser';

export class ConfigurationCompany {
  public company: Company;
  public connectionData: ConnectionData;
  public personalData: PersonalData;
  public services: Services;
}

export class Company {
  public publicName: string;
  public companyName: string;
  public companyLogo: string;
  public loginLogo: string;
  public primaryColor: string;
  public secondaryColor: string;
  public multiCompany: boolean;
  public resourcesUrl: string;
  public editPersonalData: boolean;
  public companyInfo: {};
  public bots: [{ title: string, url: string, active: boolean, urlSafe: SafeResourceUrl }];
  public customHome: CustomHome;
  public showUsersDropDate: boolean;
  public appConfig: AppConfig;
}

export class AppConfig {
  public userPersonalData: boolean;
  public permPersonalData: boolean;
  public respPersonalData: boolean;
  public userCurriculum: boolean;
  public permCurriculum: boolean;
  public respCurriculum: boolean;
}

export class ConnectionData {
  public url: string;
}

export class Services {
  personalData: boolean;
  personalCardPosition: boolean;
  orgchart: boolean;
  myTeam: boolean;
  surveys: boolean;
  checkinout: boolean;
  notifications: boolean;
  adminPositions: boolean;
  superAdmin: boolean;
  adminCompetences: boolean;
  massiveUserLoader: boolean;
  translations: Translations;
  account: Account;
  passwordManager: boolean;
  academy: boolean;
  observatory: boolean;
  publicRegister: boolean;
  linkedinAccess: boolean;
  facebookAccess: boolean;
  googleAccess: boolean;
  selection: boolean;
  educationIcs: boolean;
}

export class PersonalData {
  public id: boolean;
  public name: boolean;
  public lastName: boolean;
  public photo: boolean;
  public gender: boolean;
  public birthday: boolean;
  public address: boolean;
  public workplace: boolean;
  public position: boolean;
  public emails: {
    professional: boolean,
    personal: boolean,
  };
  public phones: {
    professional: boolean,
    personal: boolean
  };
  public button: boolean;
}

export class Translations {
  active: boolean;
  languages: {
    en: boolean;
    es: boolean;
    cat: boolean;
  };
}

export class Account {
  active: boolean;
  services: {
    changePassword: boolean;
  };
}

export class CustomHome {
  default: boolean;
  published: boolean;
  custom?: HomeObject;
  draft: HomeObject;
}

export class HomeObject {
  title: string;
  imgUrl: string;
  intro: string;
  description: string;
  buttonUrl: string;
}
