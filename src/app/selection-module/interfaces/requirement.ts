export interface Requirement {
    _id?: string;
    title?: string;
    description?: string;
    requirementCriteria?: Array<RequirementCriterion>;
    otherMerits?: Partial<OtherMerits>[];
    valuations?: [];
    createdAt?: string;
    updatedAt?: string;
    selected?: boolean;
}

export interface RequirementCriterion {
    scoreUniqueFormula?: boolean;
    allMeritsScore?: boolean;
    _id?: string;
    title?: string;
    type?: string;
    formula?: any;
    block?: string;
    mainValue?: number;
    maxValue?: number;
    requirementCombinations?: Array<RequirementCombination>;
}

export interface RequirementCombination {
    _id?: string;
    title?: string;
    requirement?: string;
    value?: string;
    label?: string;
    combinationValue?: number;
}
