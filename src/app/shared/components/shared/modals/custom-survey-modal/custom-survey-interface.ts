export interface CustomSurveyInterface {
    _id: string;
    title: Title;
    welcomeText: Title;
    feedbackText: Title;
    startDate: string;
    finishDate: string;
    periodicity: Periodicity;
    mandatoryAnswers: boolean;
    userCanSeeReport: boolean;
    mandatoryAnswersNumber: number;
    state: string;
    blocks: Block[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Block {
    _id: string;
    name: string;
    questions: Question[];
  }
  
  export interface Question {
    _id: string;
    name: string;
    description: string;
    type: string;
    answers: Answer[];
  }
  
  export interface Answer {
    name: string;
    action: string;
    type: string;
    urlVideo?: (null | string);
    urlImagen?: string;
  }
  
  export interface Periodicity {
    type: string;
    value: number;
  }
  
  export interface Title {
    es: string;
  }
  