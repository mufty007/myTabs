export interface User {
  name: string;
  prescriptions: Prescription[];
  createdAt: number;
}

export interface Prescription {
  id: string;
  name: string;
  dosage: number;
  times: string[];
  duration?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  needsRefill?: boolean;
  createdAt: number;
  takenTimes?: {
    [date: string]: {
      [time: string]: {
        taken: boolean;
        takenAt?: number;
      };
    };
  };
  category: string;
  uses: string[];
  frequency: 'every4hrs' | 'every8hrs' | 'twiceDaily' | 'custom';
  foodRequirements: {
    withFood: boolean;
    timeBeforeFood?: number;
    timeAfterFood?: number;
  };
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  uses: string[];
}

export interface RxNormApiResponse {
  suggestionGroup: {
    suggestionList: string[];
  };
}