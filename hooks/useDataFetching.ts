import { useState, useEffect } from 'react';
import type {
  IncomeData,
  PopulationData,
  CrimeData,
  WaterConsumptionData,
  HouseholdExpenseData
} from '@/types';
import { API_ENDPOINTS, POPULATION_MULTIPLIER } from '@/lib/constants';

export const useDataFetching = () => {
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
  const [populationData, setPopulationData] = useState<PopulationData[]>([]);
  const [crimeData, setCrimeData] = useState<CrimeData[]>([]);
  const [waterConsumptionData, setWaterConsumptionData] = useState<WaterConsumptionData[]>([]);
  const [householdExpenseData, setHouseholdExpenseData] = useState<HouseholdExpenseData[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [incomeRes, populationRes, crimeRes, waterRes, expenseRes] = await Promise.all([
          fetch(API_ENDPOINTS.INCOME),
          fetch(API_ENDPOINTS.POPULATION),
          fetch(API_ENDPOINTS.CRIME),
          fetch(API_ENDPOINTS.WATER),
          fetch(API_ENDPOINTS.EXPENSE)
        ]);

        if (incomeRes.ok) {
          const incomeJson = await incomeRes.json();
          const income: IncomeData[] = incomeJson.map((item: any) => ({
            state: item.state,
            date: item.date,
            income_median: parseFloat(item.income_median)
          }));
          setIncomeData(income);
        }

        if (populationRes.ok) {
          const popJson = await populationRes.json();
          const pop: PopulationData[] = popJson.map((item: any) => ({
            state: item.state,
            date: item.date,
            population: parseFloat(item.population || item.pop || item.total) * POPULATION_MULTIPLIER
          }));
          setPopulationData(pop);
        }

        if (crimeRes.ok) {
          const crimeJson = await crimeRes.json();
          const crime: CrimeData[] = crimeJson
            .filter((item: any) => item.district === 'All' && item.state !== 'Malaysia')
            .map((item: any) => ({
              state: item.state,
              date: item.date,
              crime: parseFloat(item.crimes)
            }));
          setCrimeData(crime);
        }

        if (waterRes.ok) {
          const waterJson = await waterRes.json();
          const water: WaterConsumptionData[] = waterJson
            .filter((item: any) => item.state !== 'Malaysia' && item.sector === 'domestic')
            .map((item: any) => ({
              state: item.state,
              date: item.date,
              consumption: parseFloat(item.value)
            }));
          setWaterConsumptionData(water);
        }

        if (expenseRes.ok) {
          const expenseJson = await expenseRes.json();
          const expense: HouseholdExpenseData[] = expenseJson.map((item: any) => ({
            state: item.state,
            date: item.date,
            expenditure_mean: parseFloat(item.expenditure_mean)
          }));
          setHouseholdExpenseData(expense);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

  return {
    incomeData,
    populationData,
    crimeData,
    waterConsumptionData,
    householdExpenseData
  };
};

