import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LANGUAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { VolumeUpIcon, VolumeOffIcon, ClockIcon, FlameIcon, BarChartIcon } from './icons';

interface RecipeDisplayProps {
  recipe: string;
  recipeImage: string;
  isGeneratingImage: boolean;
  translatedRecipe: string;
  onTranslate: (language: string) => void;
  isTranslating: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, recipeImage, isGeneratingImage, translatedRecipe, onTranslate, isTranslating }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].name);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakOnTranslate, setSpeakOnTranslate] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const contentToDisplay = useMemo(() => translatedRecipe || recipe, [recipe, translatedRecipe]);

  const recipeTitle = useMemo(() => contentToDisplay.match(/^\*\*(.*?)\*\*/m)?.[1] || '', [contentToDisplay]);
  const time = useMemo(() => contentToDisplay.match(/🕒\s*Estimated Time:\s*(.*)/)?.[1], [contentToDisplay]);
  const calories = useMemo(() => contentToDisplay.match(/🔥\s*Estimated Calories:\s*(.*)/)?.[1], [contentToDisplay]);
  const difficulty = useMemo(() => contentToDisplay.match(/💪\s*Difficulty Level:\s*(.*)/)?.[1], [contentToDisplay]);
  
  const recipeBody = useMemo(() => {
    return contentToDisplay
      .replace(/^\*\*(.*?)\*\*/m, '') // remove title
      .replace(/🕒\s*Estimated Time:.*|🔥\s*Estimated Calories:.*|💪\s*Difficulty Level:.*|Short Description:.*|❤️ Healthy Tip:.*[\r\n]*/g, '')
      .replace(/(\n\n)(Ingredients|Instructions)/g, '\n$2') // Reduce space before headings
      .trim();
  }, [contentToDisplay]);

  const healthyTip = useMemo(() => contentToDisplay.match(/❤️\s*Healthy Tip:\s*(.*)/)?.[1], [contentToDisplay]);

  const cleanTextForSpeech = (markdown: string) => {
    return markdown
      .replace(/(\*\*|__|#+\s|`|---|🕒|🔥|❤️|💪)/g, '') 
      .replace(/(\r\n|\n|\r)/gm, '. ') 
      .replace(/\[.*?\]\(.*?\)/g, (match) => match.split('](')[0].substring(1));
  };
  
  const speakText = (text: string, langName: string) => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
      const langObj = LANGUAGES.find(l => l.name === langName) || LANGUAGES[0];
      const voiceForLang = voices.find(voice => voice.lang.startsWith(langObj.code));
      
      utterance.voice = voiceForLang || null;
      utterance.lang = voiceForLang ? voiceForLang.lang : langObj.code;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        const errorEvent = event as SpeechSynthesisErrorEvent;
        console.error('Speech synthesis error:', errorEvent.error, errorEvent);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    } else {
      const currentLangName = translatedRecipe ? selectedLanguage : LANGUAGES[0].name;
      speakText(contentToDisplay, currentLangName);
    }
  };

  const handleTranslateClick = (speak = false) => {
    const selectedLang = LANGUAGES.find(l => l.name === selectedLanguage);
    if (selectedLang) {
      setSpeakOnTranslate(speak);
      onTranslate(selectedLang.name);
    }
  };
  
  useEffect(() => {
    if (translatedRecipe && speakOnTranslate) {
      speakText(translatedRecipe, selectedLanguage);
      setSpeakOnTranslate(false);
    }
  }, [translatedRecipe, speakOnTranslate]);
  
  useEffect(() => {
    if (recipe) setSelectedLanguage(LANGUAGES[0].name);
  }, [recipe]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    };
  }, [contentToDisplay]);

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
      {isGeneratingImage && (
        <div className="w-full aspect-video bg-stone-200 flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="mt-2 text-stone-500">Generating dish image...</p>
        </div>
      )}
      {recipeImage && !isGeneratingImage && (
        <img src={recipeImage} alt="Generated recipe" className="w-full aspect-video object-cover" />
      )}
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
          <h1 className="text-3xl font-bold font-serif text-stone-800 mb-4 sm:mb-0 max-w-lg">{recipeTitle}</h1>
          <div className="flex items-center space-x-2 flex-shrink-0 bg-red-100/50 border border-red-300 p-2 rounded-lg">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-8 py-2 text-base bg-white text-stone-900 border-stone-300 focus:outline-none focus:ring-red-700 focus:border-red-700 rounded-md"
              disabled={isTranslating || isSpeaking}
            >
              {LANGUAGES.map((lang) => (<option key={lang.code} value={lang.name}>{lang.name}</option>))}
            </select>
            <button
              onClick={() => handleTranslateClick(false)}
              disabled={isTranslating || isSpeaking}
              className="px-4 py-2 bg-red-800 text-white font-semibold rounded-md hover:bg-red-900 disabled:bg-red-500 disabled:cursor-wait transition"
            >
              {isTranslating ? <LoadingSpinner size="sm" color="text-white" /> : 'Translate'}
            </button>
          </div>
        </div>
        
        {(time || calories || difficulty) && (
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-stone-600 border-y border-stone-200 py-4 mb-6">
            {time && <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-red-800" /><span>{time}</span></div>}
            {calories && <div className="flex items-center gap-2"><FlameIcon className="w-5 h-5 text-red-800" /><span>{calories}</span></div>}
            {difficulty && <div className="flex items-center gap-2"><BarChartIcon className="w-5 h-5 text-red-800" /><span>{difficulty}</span></div>}
          </div>
        )}
        
        <div className="prose prose-stone max-w-none prose-h2:font-serif prose-h2:text-red-800 prose-h2:border-b prose-h2:border-red-800/20 prose-h2:pb-2 prose-strong:text-stone-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipeBody}</ReactMarkdown>
        </div>

        {healthyTip && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
            <p className="font-semibold text-red-800">❤️ Healthy Tip</p>
            <p className="text-red-700">{healthyTip}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecipeDisplay;