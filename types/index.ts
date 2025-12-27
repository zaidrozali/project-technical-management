export interface IncomeData {
  state: string;
  date: string;
  income_median: number;
}

export interface PopulationData {
  state: string;
  date: string;
  population: number;
}

export interface CrimeData {
  state: string;
  date: string;
  crime: number;
}

export interface WaterConsumptionData {
  state: string;
  date: string;
  consumption: number;
}

export interface HouseholdExpenseData {
  state: string;
  date: string;
  expenditure_mean: number;
}

export type DataCategory = 'income_median' | 'population' | 'crime' | 'water_consumption' | 'expenditure';

