
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { getChat, generateSpeech } from '../services/geminiService';
import { SendIcon, CloseIcon, VolumeUpIcon, ChefHatIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface ChatbotProps {
  onClose: () => void;
}

// Audio decoding helpers from Gemini guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial', role: 'model', text: 'Hello! I am Cheffy, your personal AI cooking assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingMessageId, setIsSpeakingMessageId] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const stopCurrentSpeech = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsSpeakingMessageId(null);
  }, []);

  const handleSpeak = async (messageId: string, text: string) => {
    if (isSpeakingMessageId === messageId) {
      stopCurrentSpeech();
      return;
    }
    stopCurrentSpeech();

    try {
      setIsSpeakingMessageId(messageId);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await generateSpeech(text);
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsSpeakingMessageId(null);
        audioSourceRef.current = null;
      };
      source.start();
      audioSourceRef.current = source;
    } catch (error) {
      console.error("Speech generation failed:", error);
      alert("Sorry, I couldn't read that aloud.");
      setIsSpeakingMessageId(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    try {
      const chat = getChat();
      const stream = await chat.sendMessageStream({ message: input });
      
      let text = '';
      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: text } : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId ? { ...msg, text: 'Sorry, something went wrong. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-stone-200 rounded-2xl shadow-2xl shadow-black/30 flex flex-col z-50 border border-stone-300">
      <header className="flex items-center justify-between p-4 border-b border-stone-300 bg-stone-100 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <ChefHatIcon className="h-7 w-7 text-red-800" />
          <h2 className="text-xl font-bold font-serif text-stone-800">AI Chef Assistant</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-300 transition-colors" aria-label="Close chat">
          <CloseIcon className="w-6 h-6 text-stone-500" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <ChefHatIcon className="w-8 h-8 p-1.5 text-red-800 bg-red-800/10 rounded-full flex-shrink-0" />}
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${msg.role === 'user' ? 'bg-red-800 text-white rounded-br-none' : 'bg-white text-stone-800 rounded-bl-none border border-stone-200'}`}>
              <p className="text-sm">{msg.text}</p>
              {msg.role === 'model' && msg.text && (
                 <button 
                  onClick={() => handleSpeak(msg.id, msg.text)}
                  className="mt-2 p-1 rounded-full hover:bg-stone-200 transition-colors disabled:opacity-50"
                  aria-label={isSpeakingMessageId === msg.id ? 'Stop speaking' : 'Speak message'}
                  disabled={isLoading && !msg.text}
                  >
                  {isSpeakingMessageId === msg.id ? <LoadingSpinner size="sm" /> : <VolumeUpIcon className="w-4 h-4 text-stone-500" />}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.role === 'model' && (
            <div className="flex items-end gap-2 justify-start">
                <ChefHatIcon className="w-8 h-8 p-1.5 text-red-800 bg-red-800/10 rounded-full flex-shrink-0" />
                <div className="max-w-[80%] rounded-2xl p-3 bg-white text-stone-800 rounded-bl-none border border-stone-200">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-700 rounded-full animate-pulse"></div>
                     <div className="w-2 h-2 bg-red-700 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                     <div className="w-2 h-2 bg-red-700 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                   </div>
                </div>
            </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-300 bg-stone-100 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a cooking question..."
            className="w-full pl-4 pr-12 py-3 bg-white text-stone-900 border border-stone-300 rounded-full focus:ring-2 focus:ring-red-700 focus:border-red-700 transition"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-800 text-white rounded-full hover:bg-red-900 disabled:bg-red-400 transition" disabled={isLoading || !input.trim()} aria-label="Send message">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;