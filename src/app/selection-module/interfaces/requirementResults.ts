import { Requirement } from './requirement';

export interface RequirementsResult {
    _id?: string;
    candidatureId?: string;
    employee?: string;
    results?: Array<Results>;
    finalScore?: number;
    requirement?: Requirement;
}

export interface Results {
    _id?: string;
    block?: string;
    totalScore?: number;
    requirementsResult?: Array<RequirementResult>;
}

export interface RequirementResult {
    _id?: string;
    requirementId?: string;
    title?: string;
    totalScore?: number;
    maxValue?: number;
    combinations?: Array<Combination>;
}

export interface Combination {
    _id?: string;
    combinationId?: string;
}

