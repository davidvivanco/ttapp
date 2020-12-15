interface OtherMerits {
    _id: string;
    label: string;
    type: string;
    requirementId: string;
    meritType: string;
    highScore: number;
    lowScore: number;
    value: number;
    inputs: Input[];
}

interface Input {
    type: string;
    required: boolean;
    id: string;
}
