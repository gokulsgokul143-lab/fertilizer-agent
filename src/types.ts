export interface PlantProfile {
  plantName: string;
  plantVariety: string;
  medium: string;
  stage: string;
  symptoms: string[];
  soilType: string;
  pH: string;
  climate: string;
  organicPreference: string;
  language?: string;
}

export interface PrimaryNutrient {
  nutrient: string;
  status: "Deficient" | "Excessive" | "Optimal" | "Unknown" | string;
  role: string;
  recommendation: string;
}

export interface Micronutrient {
  nutrient: string;
  importance: string;
  remedy: string;
}

export interface FertilizerSources {
  organic: string[];
  synthetic: string[];
}

export interface FeedingSchedule {
  frequency: string;
  dosage: string;
  instructions: string;
}

export interface FertilizerRecommendation {
  summary: string;
  npkRatio: string;
  npkExplanation: string;
  soilChemistry: string;
  primaryNutrients: PrimaryNutrient[];
  micronutrients: Micronutrient[];
  fertilizerSources: FertilizerSources;
  feedingSchedule: FeedingSchedule;
  wateringAdjustments: string;
  actionPlan: string[];
  expertTips: string[];
  // Added meta-fields for saving history
  plantName?: string;
  stage?: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
