import React from 'react';
import { motion } from 'framer-motion';

interface TranslationShimmerProps {
  width?: string;
  height?: string;
}

export default function TranslationShimmer({ 
  width = '100%', 
  height = '1.5rem' 
}: TranslationShimmerProps) {
  return (
    <div 
      className="rounded-md bg-gray-700/30 overflow-hidden"
      style={{ width, height }}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-gray-700/0 via-gray-700/50 to-gray-700/0"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
        }}
      />
    </div>
  );
}