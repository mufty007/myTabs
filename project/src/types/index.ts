export interface User {
  name: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  id: string;
  name: string;
  category?: string;
  uses?: string[];
  dosage: number;
  frequency: 'every4hrs' | 'every8hrs' | 'twiceDaily' | 'custom';
  times: string[];
  duration?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  needsRefill?: boolean;
  createdAt: number;
  foodRequirements?: {
    withFood: boolean;
    timeBeforeFood?: number;
    timeAfterFood?: number;
  };
  takenTimes?: {
    [date: string]: {
      [time: string]: {
        taken: boolean;
        takenAt?: number;
      };
    };
  };
}

export interface Medicine {
  id: string;
  name: string;
  category?: string;
  uses?: string[];
}

export interface RxNormApiResponse {
  suggestionGroup: {
    suggestionList: string[];
  };
}