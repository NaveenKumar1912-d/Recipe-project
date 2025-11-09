export interface UserPreferences {
  mealType: string;
  dietaryPreference: string;
  allergies: string;
  otherRequests: string;
  ingredients: string;
  spiceLevel: string;
  difficultyLevel: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Ingredient {
  name: string;
  tamilName: string;
}