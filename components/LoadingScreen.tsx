
import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing pixel structures...",
  "Applying neural upscaling...",
  "Restoring hidden details...",
  "Calibrating HDR curves...",
  "Enhancing color fidelity...",
  "Finalizing high-resolution output...",
  "Wait, this looks amazing...",
  "Almost there!"
];

export const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  const [currentMsg, setCurrentMsg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-pulse">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-medium text-blue-400">
          {message || messages[currentMsg]}
        </h3>
        <p className="text-sm text-gray-500 mt-2">Our AI models are processing your request. Please don't close this tab.</p>
      </div>
    </div>
  );
};
