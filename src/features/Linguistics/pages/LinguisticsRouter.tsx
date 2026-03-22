import React, { useState } from 'react';
import LinguisticsHub from './LinguisticsHub';
import GlyphFoundry from './GlyphFoundry';

import { entityService } from '../../../database/entityService';

const LinguisticsRouter = () => {
 const [view, setView] = useState('hub'); // 'hub', 'foundry', 'editor'
 const [selectedWord, setSelectedWord] = useState<any>(null);

 const handleOpenEditor = (word) => {
 setSelectedWord(word);
 console.log("Opening editor for", word);
 };

 const handleSaveGlyph = async (saveData) => {
 if (saveData.wordId) {
 try {
  // Use entityService to update the word's glyph data
  const word = await entityService.getById(saveData.wordId);
  if (word) {
    const content = JSON.parse(word.contenido_json || '{}');
    content.svgPathData = saveData.svgPathData;
    await entityService.update(saveData.wordId, {
      ...word,
      contenido_json: JSON.stringify(content)
    });
    console.log("Glyph saved successfully via entityService");
  }
 } catch (err) {
 console.error("Error saving glyph:", err);
 }
 }
 setSelectedWord(null);
 setView('hub');
 };

 return (
 <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
 {view === 'hub' && (
 <LinguisticsHub onOpenEditor={handleOpenEditor} />
 )}


 </div>
 );
};

export default LinguisticsRouter;
