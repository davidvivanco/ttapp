import { CommonFunctions } from '../../commonFunctions';
import { CardPosition } from './card-position.model';
import { PersonalData } from './personal-data.model';
import { Roles } from './roles.interface';

export class Employee {
  _id: string;
  id?: number;
  externalUser?: boolean;
  password: string;
  personalData: PersonalData;
  token: string;
  roles: Array<Roles>;
  dropDate: Date;
  professionalCategory: string;
  managerId: string[];
  unityId: string;
  positionId?: string;
  cardPositionId?: string;
  cardPosition?: CardPosition;
  position: string;
  other: {};
  isManager: boolean;
  workplace: {
    id: string;
    companyId: string;
    code: string;
    name: string;
  };

  // constructor para los campos que no llegan de back
  constructor(employee) {
    const personalData = new PersonalData(employee);
    const container = {
      id: employee ? employee.id : null, _id: employee ? employee._id : null,
      roles: [], dropDate: null, professionalCategory: null, managerId: [], unityId: null, positionId: null, cardPositionId: null,
      position: null, other: null, workplace: null, highlights: [], personalData: personalData
    };
    new CommonFunctions().assignsVars(this, container, employee);
  }
}
