export const STATE_MAPPING: Record<string, string> = {
  // State IDs (lowercase) to data names
  'perlis': 'Perlis',
  'kedah': 'Kedah',
  'penang': 'Pulau Pinang',
  'perak': 'Perak',
  'terengganu': 'Terengganu',
  'pahang': 'Pahang',
  'kelantan': 'Kelantan',
  'negerisembilan': 'Negeri Sembilan',
  'malacca': 'Melaka',
  'putrajaya': 'W.P. Putrajaya',
  'selangor': 'Selangor',
  'kualalumpur': 'W.P. Kuala Lumpur',
  'johor': 'Johor',
  'sabah': 'Sabah',
  'labuan': 'W.P. Labuan',
  'sarawak': 'Sarawak',
  // Also include the capitalized versions for backward compatibility
  'Perlis': 'Perlis',
  'Kedah': 'Kedah',
  'Pulau Pinang': 'Pulau Pinang',
  'Perak': 'Perak',
  'Terengganu': 'Terengganu',
  'Pahang': 'Pahang',
  'Kelantan': 'Kelantan',
  'Negeri Sembilan': 'Negeri Sembilan',
  'Melaka': 'Melaka',
  'Putrajaya': 'W.P. Putrajaya',
  'Selangor': 'Selangor',
  'Kuala Lumpur': 'W.P. Kuala Lumpur',
  'Johor': 'Johor',
  'Sabah': 'Sabah',
  'Labuan': 'W.P. Labuan',
  'Sarawak': 'Sarawak'
};

export const API_ENDPOINTS = {
  INCOME: 'https://api.data.gov.my/data-catalogue?id=hh_income_state',
  POPULATION: 'https://api.data.gov.my/data-catalogue?id=population_state',
  CRIME: 'https://api.data.gov.my/data-catalogue?id=crime_district',
  WATER: 'https://api.data.gov.my/data-catalogue?id=water_consumption',
  EXPENSE: 'https://api.data.gov.my/data-catalogue?id=hies_state'
} as const;

export const MAX_CHART_POINTS = 20;
export const POPULATION_MULTIPLIER = 1000;

export const CHART_CONFIGS = {
  income: {
    dataKey: 'income_median',
    color: '#3b82f6',
    title: 'Median Household Income',
    emoji: '📊'
  },
  population: {
    dataKey: 'population',
    color: '#10b981',
    title: 'Population',
    emoji: '👥'
  },
  crime: {
    dataKey: 'crime',
    color: '#ef4444',
    title: 'Crime Cases',
    emoji: '🚨'
  },
  water: {
    dataKey: 'consumption',
    color: '#06b6d4',
    title: 'Water Consumption',
    emoji: '💧'
  },
  expense: {
    dataKey: 'expenditure_mean',
    color: '#f59e0b',
    title: 'Mean Household Expenditure',
    emoji: '💰'
  }
} as const;

export type ChartType = keyof typeof CHART_CONFIGS;

