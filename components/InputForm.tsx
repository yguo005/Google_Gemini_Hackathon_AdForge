import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';

// Fix for SpeechRecognition API not being in standard TypeScript lib
// By adding these interfaces, we can use the SpeechRecognition API without TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface InputFormProps {
  onSubmit: (productDescription: string, audiences: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [productDescription, setProductDescription] = useState('');
  const [audiences, setAudiences] = useState('');
  const [listeningFor, setListeningFor] = useState<'product' | 'audiences' | null>(null);

  // Use a ref to store the text that was in the input when recognition started.
  // This avoids issues with stale closures inside the event handlers.
  const initialTextRef = useRef(''); 
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    // Cleanup function to stop listening if the component unmounts
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListeningFor(null);
  };

  const toggleListen = (field: 'product' | 'audiences') => {
    if (listeningFor === field) {
      stopListening();
      return;
    }

    if (listeningFor && listeningFor !== field) {
        stopListening();
    }

    // Store the initial text for the target field to append to it.
    initialTextRef.current = field === 'product' ? productDescription : audiences;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // The event.results object contains the list of all results so far.
      // Iterate through it to construct the complete transcript from this session.
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      // Combine the initial text with the new transcript. Add a space if needed.
      const separator = initialTextRef.current.trim() === '' ? '' : ' ';
      const newText = initialTextRef.current + separator + finalTranscript + interimTranscript;

      if (field === 'product') {
        setProductDescription(newText);
      } else {
        setAudiences(newText);
      }
    };

    recognition.onend = () => {
      // The onresult event with isFinal=true handles setting the final text.
      // We just need to clean up the listening state.
      if (listeningFor === field) {
        stopListening();
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (listeningFor === field) {
        stopListening();
      }
    };

    recognition.start();
    setListeningFor(field);
  };

  const MicButton: React.FC<{ field: 'product' | 'audiences' }> = ({ field }) => {
    const isListening = listeningFor === field;
    const isDisabled = isLoading || (listeningFor !== null && !isListening) || !isSpeechRecognitionSupported;
    
    let tooltipText = `Transcribe voice for ${field === 'product' ? 'product description' : 'audiences'}`;
    if (isListening) tooltipText = "Stop listening";
    if (isDisabled && listeningFor !== null && !isListening) tooltipText = "Another microphone is active";
    if (!isSpeechRecognitionSupported) tooltipText = "Voice input is not supported by your browser";

    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
        <button
          type="button"
          onClick={() => toggleListen(field)}
          disabled={isDisabled}
          className={`p-2 rounded-full transition-colors ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-slate-600 text-slate-300 hover:bg-purple-600 hover:text-white'
          } disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed`}
          aria-label={tooltipText}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 2a1 1 0 11-2 0V4a1 1 0 112 0v2zm-4 4a1 1 0 011 1v1a3 3 0 006 0v-1a1 1 0 112 0v1a5 5 0 01-4.226 4.935A1 1 0 019 14v1H7v-1a1 1 0 01-.774-.935A5 5 0 015 9V8a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltipText}
        </span>
      </div>
    );
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDescription.trim() || !audiences.trim()) {
      return;
    }
    onSubmit(productDescription, audiences);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
        <div className="relative">
          <label htmlFor="productDescription" className="block text-sm font-medium text-slate-300 mb-2">
            Product Description
          </label>
          <textarea
            id="productDescription"
            name="productDescription"
            rows={4}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 pr-12 text-slate-200 focus:ring-purple-500 focus:border-purple-500 transition"
            placeholder="e.g., An innovative smart coffee mug that keeps your drink at the perfect temperature for hours."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            disabled={isLoading || listeningFor === 'product'}
            required
          />
          <MicButton field="product" />
        </div>
        <div className="relative">
          <label htmlFor="audiences" className="block text-sm font-medium text-slate-300 mb-2">
            Target Audiences (comma-separated)
          </label>
          <input
            type="text"
            id="audiences"
            name="audiences"
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 pr-12 text-slate-200 focus:ring-purple-500 focus:border-purple-500 transition"
            placeholder="e.g., Tech Enthusiasts, Busy Professionals, Coffee Connoisseurs"
            value={audiences}
            onChange={(e) => setAudiences(e.target.value)}
            disabled={isLoading || listeningFor === 'audiences'}
            required
          />
          <MicButton field="audiences" />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || listeningFor !== null || !productDescription.trim() || !audiences.trim()}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Spinner className="w-5 h-5 mr-3" />
                Generating...
              </>
            ) : (
              'Generate Ad Creatives'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;