import type { Plan } from '../types';

const STORAGE_KEY = 'timeCraftPlans';

export function getSavedPlans(): Plan[] {
  try {
    const savedPlansJson = localStorage.getItem(STORAGE_KEY);
    return savedPlansJson ? JSON.parse(savedPlansJson) : [];
  } catch (error) {
    console.error("Failed to load plans from localStorage", error);
    return [];
  }
}

export function savePlan(plan: Plan): void {
  try {
    const existingPlans = getSavedPlans();
    const updatedPlans = [...existingPlans, plan];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  } catch (error) {
    console.error("Failed to save plan to localStorage", error);
  }
}

export function updatePlan(updatedPlan: Plan): void {
  try {
    const existingPlans = getSavedPlans();
    const planIndex = existingPlans.findIndex(p => p.id === updatedPlan.id);
    if (planIndex > -1) {
      existingPlans[planIndex] = updatedPlan;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPlans));
    }
  } catch (error) {
    console.error("Failed to update plan in localStorage", error);
  }
}

export function deletePlan(planId: string): void {
  try {
    const existingPlans = getSavedPlans();
    const updatedPlans = existingPlans.filter(plan => plan.id !== planId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  } catch (error) {
    console.error("Failed to delete plan from localStorage", error);
  }
}
