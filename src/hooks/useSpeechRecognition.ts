import { useState, useRef, useEffect } from 'react';

interface SpeechRecognitionError extends Event {
  error: string;
}
export interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = ({
  language = 'en-US',
  onResult,
  onError,
  onStart,
  onEnd,
}: SpeechRecognitionOptions) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = language;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onStart?.();
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcriptArray = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');

        const isFinal = event.results[event.results.length - 1].isFinal;
        onResult?.(transcriptArray, isFinal);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
        onError?.(event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onEnd?.();
      };
    }

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  return { isListening, startListening, stopListening };
};
