'use client';

import { motion } from 'framer-motion';

interface ChecklistItemProps {
  title: string;
  description: string;
  tag: 'MUSS' | 'IDEAL' | 'BONUS';
  checked: boolean;
  onToggle: () => void;
}

export default function ChecklistItem({ 
  title, 
  description, 
  tag, 
  checked, 
  onToggle 
}: ChecklistItemProps) {
  const getTagStyles = (tagType: 'MUSS' | 'IDEAL' | 'BONUS') => {
    switch (tagType) {
      case 'MUSS':
        return 'bg-accent text-white';
      case 'IDEAL':
        return 'border border-accent text-accent bg-transparent';
      case 'BONUS':
        return 'border border-secondary text-secondary bg-transparent';
      default:
        return 'border border-secondary text-secondary bg-transparent';
    }
  };

  // Parse description and make bold text orange
  const parseDescription = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold text-accent">
            {boldText}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div 
      className={`bg-surface border rounded-xl p-4 transition-all duration-300 ${
        checked 
          ? 'border-accent shadow-lg shadow-accent/20' 
          : 'border-border hover:border-border/60'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <motion.button
          onClick={onToggle}
          className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-1 ${
            checked 
              ? 'bg-accent border-accent' 
              : 'border-border hover:border-accent/50'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: checked ? 1 : 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30 
            }}
          >
            <svg 
              className="w-3 h-3 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </motion.div>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-primary text-base leading-tight">
            {title}
          </h3>
          <p className="text-secondary text-sm mt-2 leading-relaxed">
            {parseDescription(description)}
          </p>
        </div>

        {/* Tag Badge */}
        <span className={`px-2 py-1 text-xs font-bold rounded-md flex-shrink-0 ${getTagStyles(tag)}`}>
          {tag}
        </span>
      </div>
    </motion.div>
  );
}