import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LANGUAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { VolumeUpIcon, VolumeOffIcon } from './icons';

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

  // Load available speech synthesis voices from the browser
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    // Voices load asynchronously, so we check initially and also listen for the 'voiceschanged' event.
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const contentToDisplay = useMemo(() => {
    return translatedRecipe || recipe;
  }, [recipe, translatedRecipe]);

  const cleanTextForSpeech = (markdown: string) => {
    return markdown
      .replace(/(\*\*|__|#+\s|`|---|🕒|🔥|❤️)/g, '') // Remove formatting and icons
      .replace(/(\r\n|\n|\r)/gm, '. ') // Replace newlines with periods for pauses
      .replace(/\[.*?\]\(.*?\)/g, (match) => match.split('](')[0].substring(1)); // Handle links
  };
  
  const speakText = (text: string, langName: string) => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const textToSpeak = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const langObj = LANGUAGES.find(l => l.name === langName) || LANGUAGES[0];
      
      const voiceForLang = voices.find(voice => voice.lang.startsWith(langObj.code));
      if (voiceForLang) {
          utterance.voice = voiceForLang;
          utterance.lang = voiceForLang.lang;
      } else {
          utterance.lang = langObj.code;
          console.warn(`No voice found for language code "${langObj.code}". Using browser default.`);
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
          const errorEvent = event as SpeechSynthesisErrorEvent;
          if (errorEvent.error === 'interrupted') {
              console.warn('Speech synthesis was interrupted.');
          } else {
              console.error('Speech synthesis error:', errorEvent.error, errorEvent);
              alert(`Sorry, I couldn't read the recipe aloud. Your browser may not support the selected language (${langObj.name}).\nError: ${errorEvent.error}`);
          }
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
      if (speak) {
        setSpeakOnTranslate(true);
      } else {
        setSpeakOnTranslate(false);
      }
      onTranslate(selectedLang.name);
    }
  };
  
  useEffect(() => {
    if (translatedRecipe && speakOnTranslate) {
      speakText(translatedRecipe, selectedLanguage);
      setSpeakOnTranslate(false); // Reset intent
    }
  }, [translatedRecipe, speakOnTranslate]);
  

  // Reset translated recipe if original recipe changes
  useEffect(() => {
    if (recipe) {
      setSelectedLanguage(LANGUAGES[0].name);
    }
  }, [recipe]);

  // Cleanup speech synthesis on component unmount or when content changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [contentToDisplay]);

  return (
    <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-stone-200 prose prose-stone max-w-none prose-h1:text-orange-600 prose-h2:text-orange-600 prose-h2:border-b prose-h2:border-orange-200 prose-h2:pb-2 prose-strong:text-stone-700">
      
      {isGeneratingImage && (
        <div className="not-prose w-full aspect-video bg-stone-100 rounded-lg flex flex-col items-center justify-center mb-6">
          <LoadingSpinner />
          <p className="mt-2 text-stone-600">Generating dish image...</p>
        </div>
      )}
      {recipeImage && !isGeneratingImage && (
        <img src={recipeImage} alt="Generated recipe" className="not-prose w-full aspect-video object-cover rounded-lg mb-6 shadow-md" />
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 not-prose">
        <h2 className="text-xl font-bold text-stone-800 mb-4 sm:mb-0">Your Custom Recipe</h2>
        <div className="flex items-center space-x-2">
           <button
            onClick={handleSpeechToggle}
            className="p-2 rounded-md hover:bg-stone-100 transition"
            aria-label={isSpeaking ? "Stop reading recipe" : "Read recipe aloud"}
            title={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {isSpeaking ? (
              <VolumeOffIcon className="w-6 h-6 text-orange-600" />
            ) : (
              <VolumeUpIcon className="w-6 h-6 text-stone-600" />
            )}
          </button>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-8 py-2 text-base border-stone-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
            disabled={isTranslating || isSpeaking}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>{lang.name}</option>
            ))}
          </select>
          <button
            onClick={() => handleTranslateClick(false)}
            disabled={isTranslating || isSpeaking}
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-wait transition"
          >
            {isTranslating && !speakOnTranslate ? <LoadingSpinner size="sm" /> : 'Translate'}
          </button>
           <button
            onClick={() => handleTranslateClick(true)}
            disabled={isTranslating || isSpeaking}
            className="p-2 rounded-md hover:bg-stone-100 transition disabled:opacity-50"
            aria-label="Translate and read aloud"
            title="Translate and read aloud"
          >
            {isTranslating && speakOnTranslate ? <LoadingSpinner size="sm"/> : <VolumeUpIcon className="w-6 h-6 text-orange-500" />}
          </button>
        </div>
      </div>
      
      {isTranslating && !translatedRecipe && (
        <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-orange-600">Translating...</p>
        </div>
      )}

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {contentToDisplay}
      </ReactMarkdown>
    </div>
  );
};

export default RecipeDisplay;