
export interface DreamInterpretation {
  title: string;
  summary: string;
  identifiedSymbols: {
    symbol: string;
    meaning: string;
    archetype: string;
  }[];
}

export interface DreamAnalysis {
  transcription: string;
  imageUrl: string;
  interpretation: DreamInterpretation;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
