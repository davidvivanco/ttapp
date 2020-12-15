import { Address } from './address.model';
import { CommonFunctions } from 'src/app/commonFunctions';

export class PersonalData {
  address: Address;
  birthday: Date;
  email: {
    personal: string[];
    professional: string[];
  };
  name: string;
  lastName: string;
  photo: string;
  gender: string;
  phones: {
    professional: [{
      value: string;
      isMobile: boolean;
    }]
    personal: [{
      value: string;
      isMobile: boolean;
    }]
  };
  // constructor para los campos que no llegan de back
  constructor(employee?) {
    // si me llegan arrays vacíos, le meto un string vacío para que no pete el formcontrol
    if (employee && employee.personalData && employee.personalData.email) {
      if (!employee.personalData.email.personal || !employee.personalData.email.personal.length) {
        employee.personalData.email.personal = [''];
      }
      if (!employee.personalData.email.professional || !employee.personalData.email.professional.length) {
        employee.personalData.email.professional = [''];
      }
    }
    const container = {
      address: new Address(employee && employee.personalData ? employee.personalData.address : {}),
      birthday: '', name: '',
      lastName: '', photo: '', gender: '',
      email: employee && employee.personalData ? employee.personalData.email : {
        personal: [''],
        professional: ['']
      },
      phones: {
        professional: [{ value: '', isMobile: false }],
        personal: [{ value: '', isMobile: false }]
      }
    };

    if (employee) new CommonFunctions().assignsVars(this, container, employee.personalData);
  }
}
