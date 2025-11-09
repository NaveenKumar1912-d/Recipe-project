import React, { useState, useMemo } from 'react';
import type { UserPreferences } from '../types';
import { MEAL_TYPES, DIETARY_PREFERENCES, SPICE_LEVELS, COMMON_INGREDIENTS, DIFFICULTY_LEVELS } from '../constants';
import { SparklesIcon, SearchIcon } from './icons';

interface RecipeFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[0]);
  const [dietaryPreference, setDietaryPreference] = useState<string>(DIETARY_PREFERENCES[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [otherIngredients, setOtherIngredients] = useState<string>('');
  const [spiceLevel, setSpiceLevel] = useState<string>(SPICE_LEVELS[1]);
  const [difficultyLevel, setDifficultyLevel] = useState<string>(DIFFICULTY_LEVELS[0]);
  const [allergies, setAllergies] = useState<string>('');
  const [otherRequests, setOtherRequests] = useState<string>('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState<string>('');
  const [animateButton, setAnimateButton] = useState(false);

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  const finalIngredients = useMemo(() => {
    const otherIngs = otherIngredients.split(',').map(s => s.trim()).filter(Boolean);
    return Array.from(new Set([...selectedIngredients, ...otherIngs])).join(', ');
  }, [selectedIngredients, otherIngredients]);
  
  const filteredIngredients = useMemo(() => {
    if (!ingredientSearchTerm) {
      return COMMON_INGREDIENTS;
    }
    const searchTerm = ingredientSearchTerm.toLowerCase();
    return COMMON_INGREDIENTS.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm) ||
        ingredient.tamilName.toLowerCase().includes(searchTerm)
    );
  }, [ingredientSearchTerm]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !finalIngredients) return;
    setAnimateButton(true);
    onSubmit({ 
      mealType, 
      dietaryPreference, 
      allergies, 
      otherRequests, 
      ingredients: finalIngredients, 
      spiceLevel,
      difficultyLevel
    });
  };

  const InputLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-md font-semibold text-stone-700 mb-2">
      {children}
    </label>
  );

  const baseInputClasses = "w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200";
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-stone-200">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">Find Your Perfect Meal</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <InputLabel htmlFor="mealType">Meal Type (உணவு வகை)</InputLabel>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className={`${baseInputClasses} appearance-none`}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <InputLabel htmlFor="dietaryPreference">Dietary Preference (உணவு விருப்பம்)</InputLabel>
            <select
              id="dietaryPreference"
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className={`${baseInputClasses} appearance-none`}
            >
              {DIETARY_PREFERENCES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <InputLabel htmlFor="difficultyLevel">Difficulty (சிரமம்)</InputLabel>
            <select
              id="difficultyLevel"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className={`${baseInputClasses} appearance-none`}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <InputLabel>Ingredients on Hand (கையிலுள்ள பொருட்கள்)</InputLabel>
          <div className="relative mb-4">
            <input
              type="text"
              value={ingredientSearchTerm}
              onChange={(e) => setIngredientSearchTerm(e.target.value)}
              placeholder="Search ingredients (e.g., Ragi, வெங்காயம்)"
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-stone-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 min-h-[120px] items-start content-start">
            {filteredIngredients.map((ingredient) => (
               <button
                type="button"
                key={ingredient.name}
                onClick={() => handleIngredientToggle(ingredient.name)}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 border text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${selectedIngredients.has(ingredient.name) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-stone-300 hover:bg-orange-50 hover:border-orange-300'}`}
              >
                {ingredient.name} <span className="opacity-75">({ingredient.tamilName})</span>
              </button>
            ))}
            {filteredIngredients.length === 0 && (
                <p className="w-full text-center text-stone-500 py-4 self-center">No ingredients found matching your search.</p>
            )}
          </div>
        </div>
        
         <div>
          <InputLabel htmlFor="otherIngredients">Any other ingredients? (வேறு ஏதேனும் பொருட்கள்?)</InputLabel>
          <input
            id="otherIngredients"
            type="text"
            value={otherIngredients}
            onChange={(e) => setOtherIngredients(e.target.value)}
            placeholder="e.g., potato, beetroot, etc."
            className={baseInputClasses}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel htmlFor="spiceLevel">Spice Level (காரத்தின் அளவு)</InputLabel>
            <select
              id="spiceLevel"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
              className={`${baseInputClasses} appearance-none`}
            >
              {SPICE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <InputLabel htmlFor="allergies">Allergies to avoid (தவிர்க்க வேண்டிய ஒவ்வாமைகள்)</InputLabel>
            <input
              id="allergies"
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g., peanuts, shellfish"
              className={baseInputClasses}
            />
          </div>
        </div>

        <div>
          <InputLabel htmlFor="otherRequests">Any other requests? (வேறு ஏதேனும் கோரிக்கைகள்?)</InputLabel>
          <textarea
            id="otherRequests"
            value={otherRequests}
            onChange={(e) => setOtherRequests(e.target.value)}
            placeholder="e.g., 'low-fat', 'no onions'"
            rows={2}
            className={baseInputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !finalIngredients}
          className={`w-full flex items-center justify-center bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 disabled:bg-orange-300 disabled:cursor-not-allowed ${animateButton ? 'animate-flash' : ''}`}
          onAnimationEnd={() => setAnimateButton(false)}
        >
          {isLoading ? (
            'Thinking...'
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Get Recipe
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RecipeForm;