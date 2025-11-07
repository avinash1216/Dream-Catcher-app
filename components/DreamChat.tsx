
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { createDreamChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon } from './Icons';
import type { Chat } from '@google/genai';

interface DreamChatProps {
  transcription: string;
}

export const DreamChat: React.FC<DreamChatProps> = ({ transcription }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatRef.current = createDreamChat(transcription);
    setMessages([{ role: 'model', text: 'What symbols or feelings from your dream would you like to explore further?' }]);
  }, [transcription]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userInput });
      setMessages([...newMessages, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
      <h2 className="text-xl font-semibold text-purple-300 mb-4 text-center">Explore Your Dream</h2>
      <div className="flex-grow h-80 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
              msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about a symbol..."
          disabled={isLoading}
          className="flex-grow bg-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
