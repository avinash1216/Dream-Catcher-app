
import React, { useState, useCallback } from 'react';
import { DreamRecorder } from './components/DreamRecorder';
import { DreamDisplay } from './components/DreamDisplay';
import { DreamChat } from './components/DreamChat';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeDream } from './services/geminiService';
import type { DreamAnalysis } from './types';

type AppState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'DISPLAYING' | 'ERROR';

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [dreamAnalysis, setDreamAnalysis] = useState<DreamAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = useCallback(async (transcription: string) => {
    if (!transcription.trim()) {
      setError("The recording was empty. Please try again.");
      setAppState('ERROR');
      return;
    }
    setAppState('PROCESSING');
    setError(null);
    try {
      const analysis = await analyzeDream(transcription);
      setDreamAnalysis(analysis);
      setAppState('DISPLAYING');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      setAppState('ERROR');
    }
  }, []);

  const handleReset = () => {
    setAppState('IDLE');
    setDreamAnalysis(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'IDLE':
      case 'RECORDING':
        return (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
              Morpheus AI
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Capture your dreams the moment you wake.
            </p>
            <DreamRecorder
              isRecording={appState === 'RECORDING'}
              onStart={() => setAppState('RECORDING')}
              onStop={handleRecordingComplete}
            />
          </div>
        );
      case 'PROCESSING':
        return <LoadingSpinner text="Analyzing your dream's echoes..." />;
      case 'DISPLAYING':
        return dreamAnalysis && (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <DreamDisplay analysis={dreamAnalysis} />
            <DreamChat transcription={dreamAnalysis.transcription} />
            <button
              onClick={handleReset}
              className="mt-4 self-center px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Record Another Dream
            </button>
          </div>
        );
      case 'ERROR':
        return (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      {renderContent()}
    </main>
  );
}
