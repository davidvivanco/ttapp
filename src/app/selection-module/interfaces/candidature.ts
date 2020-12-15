import { Offer } from './offer';
import { Employee } from '../../shared/models/employee.model';
import { RequirementsResult } from './requirementResults';

export interface Candidature {
    _id: string;
    employee: Employee;
    offer: Offer;
    createdAt: string;
    deAppliedAt?: any;
    updatedAt: string;
    requirementResults: RequirementsResult;
}

