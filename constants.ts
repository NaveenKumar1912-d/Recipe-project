import type { Language, Ingredient } from './types';

export const MEAL_TYPES: string[] = [
  "Breakfast (காலை உணவு)",
  "Lunch (மதிய உணவு)",
  "Dinner (இரவு உணவு)",
  "Snack (சிற்றுண்டி)",
  "Dessert (இனிப்பு)"
];

export const DIETARY_PREFERENCES: string[] = [
  "Vegetarian (சைவம்)",
  "Non-Vegetarian (அசைவம்)",
  "Vegan (சைவ உணவு)",
  "Gluten-Free ( பசையம் இல்லாதது)"
];

export const SPICE_LEVELS: string[] = [
  "Mild (மிதமான)",
  "Medium (நடுத்தர)",
  "Spicy (காரம்)"
];

export const DIFFICULTY_LEVELS: string[] = [
  "Easy (எளிதான)",
  "Medium (நடுத்தர)",
  "Hard (கடினமான)"
];

export const LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
];

export const COMMON_INGREDIENTS: Ingredient[] = [
  { name: 'Rice', tamilName: 'அரிசி' },
  { name: 'Ragi', tamilName: 'ராகி' },
  { name: 'Banana', tamilName: 'வாழைப்பழம்' },
  { name: 'Jaggery', tamilName: 'வெல்லம்' },
  { name: 'Coconut', tamilName: 'தேங்காய்' },
  { name: 'Drumstick', tamilName: 'முருங்கை' },
  { name: 'Brinjal', tamilName: 'கத்திரிக்காய்' },
  { name: 'Tomato', tamilName: 'தக்காளி' },
  { name: 'Onion', tamilName: 'வெங்காயம்' },
  { name: 'Tamarind', tamilName: 'புளி' },
  { name: 'Lentils', tamilName: 'பருப்பு' },
  { name: 'Chilli', tamilName: 'மிளகாய்' },
  { name: 'Garlic', tamilName: 'பூண்டு' },
  { name: 'Ginger', tamilName: 'இஞ்சி' },
  { name: 'Coriander', tamilName: 'மல்லி' },
  { name: 'Curry Leaves', tamilName: 'கறிவேப்பிலை' },
  { name: 'Mustard Seeds', tamilName: 'கடுகு' },
  { name: 'Turmeric', tamilName: 'மஞ்சள்' },
  { name: 'Potato', tamilName: 'உருளைக்கிழங்கு' },
  { name: 'Lady\'s Finger', tamilName: 'வெண்டைக்காய்' },
  { name: 'Curd', tamilName: 'தயிர்' },
  { name: 'Ghee', tamilName: 'நெய்' },
  { name: 'Chicken', tamilName: 'கோழி' },
  { name: 'Mutton', tamilName: 'மட்டன்' },
];