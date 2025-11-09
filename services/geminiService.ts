import { GoogleGenAI, Modality } from "@google/genai";
import type { UserPreferences } from '../types';

// FIX: Adhere to coding guidelines by using process.env.API_KEY. This also
// resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getRecipe(preferences: UserPreferences): Promise<string> {
  const { mealType, dietaryPreference, allergies, otherRequests, ingredients, spiceLevel, difficultyLevel } = preferences;

  const prompt = `
    You are a friendly and expert chef specializing in healthy, authentic Tamil Nadu cuisine.
    A user wants a recipe based on ingredients they already have.

    **CRITICAL INSTRUCTION:** You MUST generate a recipe primarily using the ingredients provided by the user. If essential pantry staples like salt, oil, or basic spices (like turmeric or mustard seeds) are needed and not listed, you may include them. However, the main components of the dish MUST come from the user's list. If the ingredients are insufficient for a recipe, politely state that and suggest what else might be needed.

    User Preferences:
    - Meal Type: ${mealType}
    - Dietary Preference: ${dietaryPreference}
    - Ingredients on hand: ${ingredients}
    - Desired Spice Level: ${spiceLevel}
    - Desired Difficulty Level: ${difficultyLevel}
    - Allergies to avoid: ${allergies || 'None specified'}
    - Other requests: ${otherRequests || 'None specified'}

    Please provide a detailed recipe with the following structure, formatted in Markdown:
    - **Recipe Title**: **An authentic and appealing Tamil name with an English translation in parentheses.** For example: "**Ragi Banana Pancake (மரக்கழி வாழைப்பழ அடை)**". The title must be on the first line and in bold.
    - **Short Description**: A one or two-sentence description of the dish.
    - **🕒 Estimated Time**: The approximate total time for preparation and cooking.
    - **🔥 Estimated Calories**: A rough estimate of the calories per serving.
    - **💪 Difficulty Level**: The estimated difficulty (Easy, Medium, or Hard).
    - **Ingredients**: A bulleted list of all ingredients with precise measurements (e.g., 1 cup, 2 tsp).
    - **Instructions**: A numbered list of clear, step-by-step instructions.
    - **❤️ Healthy Tip**: A specific, helpful tip related to the recipe and the user's preferences. For example: "This recipe is rich in fiber and great for diabetics as it uses jaggery instead of sugar." or "To make this lower in fat, you can pan-fry with minimal oil instead of deep-frying."

    Ensure the recipe is authentic to Tamil Nadu's culinary style. Do not include any unsafe or non-edible ingredients.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
}

export async function generateRecipeImage(recipeTitle: string): Promise<string> {
  const prompt = `A vibrant, appetizing photograph of "${recipeTitle}", a traditional and healthy dish from Tamil Nadu, presented beautifully in authentic kitchenware.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate recipe image.");
  }
}

export async function translateText(text: string, language: string): Promise<string> {
  const prompt = `
    You are an expert translator. Please translate the following recipe into the language: ${language}.
    Preserve the original Markdown formatting (headings, bold text, lists, etc.) exactly as it is.
    Do not add any extra text or explanations, just provide the direct translation.

    Recipe to translate:
    ---
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to communicate with the AI model for translation.");
  }
}