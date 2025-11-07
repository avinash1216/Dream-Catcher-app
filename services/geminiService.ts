
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { DreamAnalysis, DreamInterpretation } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSurrealistPrompt = async (transcription: string): Promise<string> => {
  const prompt = `Based on the following dream transcription, generate a short, evocative prompt for an AI image generator. The prompt should capture the core emotional theme and key surreal elements of the dream. Focus on creating a visually striking and dreamlike scene. Style: Surrealist painting. Dream: "${transcription}"`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

const generateDreamImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    }
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error('Image generation failed.');
  }

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

const getDreamInterpretation = async (transcription: string): Promise<DreamInterpretation> => {
  const prompt = `Analyze the following dream transcription from a psychological perspective, heavily referencing Jungian archetypes. Provide a structured analysis in JSON format. The analysis should include a title for the dream, a summary of its potential meaning, and an array of identified symbols with their corresponding meanings and associated archetypes. Dream: "${transcription}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "An evocative title for the dream." },
                summary: { type: Type.STRING, description: "A summary of the dream's potential psychological meaning." },
                identifiedSymbols: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            symbol: { type: Type.STRING, description: "The key symbol identified in the dream." },
                            meaning: { type: Type.STRING, description: "The potential psychological meaning of the symbol." },
                            archetype: { type: Type.STRING, description: "The relevant Jungian archetype (e.g., The Shadow, The Anima/Animus, The Self)." }
                        },
                        required: ["symbol", "meaning", "archetype"]
                    }
                }
            },
            required: ["title", "summary", "identifiedSymbols"]
        }
    }
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as DreamInterpretation;
  } catch (e) {
    console.error("Failed to parse JSON interpretation:", jsonText);
    throw new Error("The AI returned an invalid analysis format. Please try again.");
  }
};

export const analyzeDream = async (transcription: string): Promise<DreamAnalysis> => {
  const imagePrompt = await getSurrealistPrompt(transcription);
  const [imageUrl, interpretation] = await Promise.all([
    generateDreamImage(imagePrompt),
    getDreamInterpretation(transcription)
  ]);

  return {
    transcription,
    imageUrl,
    interpretation,
  };
};

export const createDreamChat = (transcription: string): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful and insightful dream analysis assistant. The user has just had the following dream, which has been transcribed: "${transcription}". Your role is to answer their follow-up questions about specific symbols, feelings, or events in the dream. Base your answers on psychological principles, particularly Jungian archetypes, but speak in a clear, accessible, and supportive tone.`,
    }
  });
};
