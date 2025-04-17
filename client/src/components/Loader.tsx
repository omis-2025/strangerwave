import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4'
};

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  return (
    <div 
      className={`
        animate-spin 
        rounded-full 
        border-t-transparent
        border-primary
        ${sizeMap[size]} 
        ${className}
      `}
      aria-label="Loading"
    />
  );
};

export default Loader;