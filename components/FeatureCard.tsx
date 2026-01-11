
import React from 'react';
import { AppFeature } from '../types';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  feature: AppFeature;
  onClick: (feature: AppFeature) => void;
  active: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, feature, onClick, active }) => {
  return (
    <button
      onClick={() => onClick(feature)}
      className={`flex flex-col items-start p-6 rounded-2xl transition-all duration-300 text-left ${
        active 
          ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg shadow-blue-500/20' 
          : 'bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
      }`}
    >
      <div className={`p-3 rounded-xl mb-4 ${active ? 'bg-white/20' : 'bg-gray-700/50'}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-1 ${active ? 'text-white' : 'text-gray-100'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${active ? 'text-blue-100' : 'text-gray-400'}`}>{description}</p>
    </button>
  );
};
