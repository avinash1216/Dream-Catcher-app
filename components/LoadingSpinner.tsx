
import React from 'react';

interface LoadingSpinnerProps {
  text: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xl text-gray-300 font-semibold">{text}</p>
    </div>
  );
};
