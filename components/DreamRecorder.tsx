
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveSession } from "@google/genai";
import { MicIcon, StopCircleIcon } from './Icons';
import { createBlob } from '../utils/audio';

interface DreamRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: (transcription: string) => void;
}

export const DreamRecorder: React.FC<DreamRecorderProps> = ({ isRecording, onStart, onStop }) => {
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const transcriptionRef = useRef<string>('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const startRecording = async () => {
    onStart();
    transcriptionRef.current = '';

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: (message) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptionRef.current += text;
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => console.log('Live API connection closed.'),
        },
        config: {
          inputAudioTranscription: {},
          responseModalities: [Modality.AUDIO], // Required, though we won't use the audio output
        },
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      onStop(''); // Propagate error state
    }
  };

  const stopRecording = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Give a moment for final transcription packets to arrive
    setTimeout(() => {
      onStop(transcriptionRef.current);
    }, 200);
  }, [onStop]);

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400/50 animate-pulse'
          : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/50'
      }`}
    >
      <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
      {isRecording ? <StopCircleIcon className="w-12 h-12" /> : <MicIcon className="w-12 h-12" />}
    </button>
  );
};
