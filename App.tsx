
import React, { useState, useCallback } from 'react';
import type { UserPreferences } from './types';
import { getRecipe, generateRecipeImage, translateText } from './services/geminiService';
import Header from './components/Header';
import RecipeForm from './components/RecipeForm';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Chatbot from './components/Chatbot';
import { ChatBubbleIcon } from './components/icons';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recipe, setRecipe] = useState<string>('');
  const [recipeImage, setRecipeImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [translatedRecipe, setTranslatedRecipe] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleRecipeRequest = useCallback(async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError('');
    setRecipe('');
    setRecipeImage('');
    setTranslatedRecipe('');
    setPreferences(prefs);
    try {
      const generatedRecipe = await getRecipe(prefs);
      setRecipe(generatedRecipe);
      setIsLoading(false); // Show text recipe first
      
      setIsGeneratingImage(true);
      try {
        // Extract title for image generation
        const titleMatch = generatedRecipe.match(/\*\*(.*?)\*\*/);
        const recipeTitle = titleMatch ? titleMatch[1] : `A dish with ${prefs.ingredients}`;
        
        const imageUrl = await generateRecipeImage(recipeTitle);
        setRecipeImage(imageUrl);
      } catch (imgError) {
        console.error("Could not generate image:", imgError);
        // Not setting a user-facing error for image, as the recipe is the main content
      } finally {
        setIsGeneratingImage(false);
      }
    } catch (e) {
      setError('Sorry, I couldn\'t find a recipe. Please try again.');
      console.error(e);
      setIsLoading(false);
    } 
  }, []);

  const handleTranslateRequest = useCallback(async (language: string) => {
    if (!recipe) return;
    setIsTranslating(true);
    setError('');
    try {
      const translation = await translateText(recipe, language);
      setTranslatedRecipe(translation);
    } catch (e) {
      setError('Sorry, I couldn\'t translate the recipe. Please try again.');
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  }, [recipe]);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <RecipeForm onSubmit={handleRecipeRequest} isLoading={isLoading} />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-red-800 font-serif">Finding the perfect recipe for you...</p>
            </div>
          )}

          {recipe && !isLoading && (
            <RecipeDisplay 
              recipe={recipe} 
              recipeImage={recipeImage}
              isGeneratingImage={isGeneratingImage}
              translatedRecipe={translatedRecipe}
              onTranslate={handleTranslateRequest}
              isTranslating={isTranslating}
            />
          )}

          {!recipe && !isLoading && !error && (
            <div className="text-center bg-white/60 p-10 rounded-2xl shadow-md border border-stone-200">
                <h2 className="text-2xl font-bold font-serif text-red-800 mb-2">Welcome to your Tamil Nadu AI Chef!</h2>
                <p className="text-stone-600 max-w-prose mx-auto">Tell me what you'd like to eat, and I'll whip up a healthy, authentic recipe just for you.</p>
            </div>
          )}
          
        </div>
      </main>
      <footer className="text-center py-4 text-stone-500 text-sm">
        <p>Powered by AI. Always cook responsibly.</p>
      </footer>
      
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-red-800 text-white rounded-full p-4 shadow-lg hover:bg-red-900 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 z-50"
          aria-label="Open chat"
        >
          <ChatBubbleIcon className="w-8 h-8" />
        </button>
      )}
      
      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default App;