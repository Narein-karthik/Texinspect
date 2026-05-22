import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { SpeechRecognition as CapSpeech } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      // Native handled via toggle
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access is blocked. Please ensure you have granted microphone permissions in your browser. If you are using this inside an iframe, try opening the app in a new tab.');
        } else if (event.error === 'network') {
          alert('Speech recognition requires an internet connection.');
        } else if (event.error === 'no-speech') {
          // Ignore no-speech silently
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript, isNative]);

  const toggleListening = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isNative) {
      try {
        const { available } = await CapSpeech.available();
        if (!available) {
          alert('Speech recognition is not available on this device.');
          return;
        }

        const perms = await CapSpeech.requestPermissions() as any;
        if (perms.speechRecognition !== 'granted') {
          alert('Microphone permission denied.');
          return;
        }

        if (isListening) {
          await CapSpeech.stop();
          setIsListening(false);
        } else {
          setIsListening(true);
          CapSpeech.start({
            language: 'en-US',
            partialResults: false,
            popup: true,
          }).then((result) => {
            if (result.matches && result.matches.length > 0) {
              onTranscript(result.matches[0]);
            }
            setIsListening(false);
          }).catch((err) => {
            console.error('Native speech error', err);
            setIsListening(false);
          });
        }
      } catch (err) {
        console.error('Capacitor speech error', err);
        setIsListening(false);
      }
      return;
    }

    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        // Request microphone permission explicitly first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Microphone permission denied', err);
        alert('Permission Denied: Could not access microphone.');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center justify-center",
        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200",
        className
      )}
      title={isListening ? "Listening..." : "Click to speak"}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};
