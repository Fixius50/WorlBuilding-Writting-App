import { useState } from 'react';

/**
 * 🧠 useAdvancedLinguistics
 * Logic for advanced linguistic operations like conjugation and phonetic evolution.
 */
export const useAdvancedLinguistics = () => {
  const [activeTab, setActiveTab] = useState<'conjugation' | 'phonetics'>('conjugation');
  const [inputText, setInputText] = useState('');
  const [rule, setRule] = useState('-[e]s');
  const [result, setResult] = useState<string[]>([]);

  const handleGenerate = () => {
    if (activeTab === 'conjugation') {
      const words = inputText.split(',').map(w => w.trim());
      const suffix = rule.startsWith('-') ? rule.substring(1) : rule;
      
      const generated = words.map(w => {
        if (suffix.startsWith('[') && suffix.includes(']')) {
          const char = suffix.match(/\[(.*?)\]/)?.[1];
          const rest = suffix.split(']')[1];
          return w.endsWith(char!) ? w + rest : w + char + rest;
        }
        return w + suffix;
      });
      setResult(generated);
    } else {
      // Simple Phonetic Evolution
      const evolved = inputText.split(',').map(w => w.trim().replace(/p/g, 'b').replace(/t/g, 'd').replace(/k/g, 'g'));
      setResult(evolved);
    }
  };

  return {
    activeTab, setActiveTab,
    inputText, setInputText,
    rule, setRule,
    result,
    handleGenerate
  };
};
