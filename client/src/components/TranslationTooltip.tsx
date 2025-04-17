import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TranslationTooltipProps {
  className?: string;
}

export default function TranslationTooltip({ className = '' }: TranslationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-300 focus:outline-none"
        aria-label="Learn about auto-translation"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full mb-2 -left-4 w-64 p-3 bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-xs">
          <div className="text-white font-medium mb-1">Auto-Translation</div>
          <p className="text-gray-300 mb-2">
            Messages from your chat partner will be automatically translated to your language.
          </p>
          <ul className="text-gray-300 space-y-1 list-disc list-inside">
            <li>Use <span className="text-blue-300">Translated</span> button to see translated text</li>
            <li>Use <span className="text-blue-300">Original</span> button to see original message</li>
            <li>Use the global toggle at the top to switch all messages at once</li>
          </ul>
          
          {/* Arrow pointing down */}
          <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1.5 left-4 border-r border-b border-gray-700"></div>
        </div>
      )}
    </div>
  );
}