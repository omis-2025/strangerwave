import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

interface CountryDisplayProps {
  country: {
    name: string;
    code: string;
    flag: string;
  };
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right';
}

export default function CountryDisplay({ 
  country, 
  label, 
  size = 'md',
  position = 'top-right'
}: CountryDisplayProps) {
  // Size classes for different display sizes
  const sizeClasses = {
    sm: {
      container: 'pl-1 pr-2 py-1',
      flag: 'w-5 h-5',
      text: 'text-xs ml-1.5',
    },
    md: {
      container: 'pl-1.5 pr-3 py-1.5',
      flag: 'w-6 h-6',
      text: 'text-sm ml-2',
    },
    lg: {
      container: 'pl-2 pr-4 py-2',
      flag: 'w-7 h-7',
      text: 'text-base ml-2.5',
    },
  };

  // Position classes
  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} z-10 flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full ${sizeClasses[size].container} shadow-lg border border-gray-700/50`}
    >
      {/* Country flag */}
      <span 
        className={`fi fi-${country.flag} rounded-full object-cover ${sizeClasses[size].flag} ring-1 ring-gray-700`}
        role="img"
        aria-label={`Flag of ${country.name}`}
      />
      
      {/* Country name with optional label */}
      <span className={`${sizeClasses[size].text} font-medium text-white`}>
        {label ? `${label}: ${country.name}` : country.name}
      </span>
    </div>
  );
}