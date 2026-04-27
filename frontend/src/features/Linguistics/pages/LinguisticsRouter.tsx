import React, { useState } from 'react';
import LinguisticsHub from './LinguisticsHub';
import GlyphFoundry from './GlyphFoundry';
import AdvancedLinguistics from './AdvancedLinguistics';

import { folderService } from '@repositories/folderService';
import { entityService } from '@infrastructure/localDB/repositories/entityService';
import Button from '@presentation/atoms/Button';

const LinguisticsRouter = () => {
 const [view, setView] = useState('hub'); // 'hub', 'foundry', 'editor', 'advanced'
 const [selectedWord, setSelectedWord] = useState<unknown>(null);
 const [editorWord, setEditorWord] = useState<any>(null);

 const handleOpenEditor = (word: any) => {
 setEditorWord(word);
 setView('editor');
 };

 const handleSaveGlyph = async (saveData: any) => {
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
        <LinguisticsHub 
          onOpenEditor={handleOpenEditor} 
          onOpenAdvanced={() => setView('advanced')}
        />
      )}
      {view === 'advanced' && (
          <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-foreground/5 bg-background/50 backdrop-blur-md flex justify-between items-center">
                <Button variant="ghost" icon="arrow_back" onClick={() => setView('hub')}>Volver al Hub</Button>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Motor Lingüístico / Laboratorio</div>
              </div>
              <AdvancedLinguistics />
          </div>
      )}
    </div>
  );
};

export default LinguisticsRouter;
