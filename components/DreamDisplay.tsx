
import React from 'react';
import type { DreamAnalysis } from '../types';

interface DreamDisplayProps {
  analysis: DreamAnalysis;
}

export const DreamDisplay: React.FC<DreamDisplayProps> = ({ analysis }) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          {analysis.interpretation.title}
        </h1>
      </div>
      <img src={analysis.imageUrl} alt="AI generated surrealist representation of the dream" className="w-full h-auto object-cover" />
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4 border-b-2 border-purple-800 pb-2">Psychological Interpretation</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{analysis.interpretation.summary}</p>

          <h3 className="text-xl font-semibold text-purple-300 mb-4">Key Symbols & Archetypes</h3>
          <div className="space-y-4">
            {analysis.interpretation.identifiedSymbols.map((symbol, index) => (
              <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                <p className="font-bold text-lg text-pink-400">{symbol.symbol}</p>
                <p className="text-gray-400 mt-1"><strong className="font-semibold text-gray-300">Meaning:</strong> {symbol.meaning}</p>
                <p className="text-gray-400 mt-1"><strong className="font-semibold text-gray-300">Archetype:</strong> {symbol.archetype}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4 border-b-2 border-purple-800 pb-2">Dream Transcription</h2>
          <div className="p-4 bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto">
            <p className="text-gray-300 italic whitespace-pre-wrap">{analysis.transcription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
