import React, { useState } from 'react';
import LinguisticsHub from './LinguisticsHub';
import AdvancedLinguistics from './AdvancedLinguistics';

import { WorkspaceUseCase } from '@application/WorkspaceUseCase';
import { EntityUseCase } from '@application/EntityUseCase';
import Button from '@components/ui/Button';

const LinguisticsRouter = () => {
  const [view, setView] = useState('hub'); // 'hub', 'foundry', 'editor', 'advanced'
  const [selectedWord, setSelectedWord] = useState<unknown>(null);
  const [editorWord, setEditorWord] = useState<unknown>(null);

  const handleOpenEditor = (word: unknown) => {
    setEditorWord(word);
    setView('editor');
  };

  const handleSaveGlyph = async (saveData: unknown) => {
    const data = saveData as { wordId?: number; svgPathData?: string };
    if (data.wordId) {
      try {
        // Use entityService to update the word's glyph data
        const word = await EntityUseCase.getById(data.wordId);
        if (word) {
          const content = JSON.parse(word.contenido_json || '{}');
          content.svgPathData = data.svgPathData;
          await EntityUseCase.update(data.wordId, {
            ...word,
            contenido_json: JSON.stringify(content)
          });
        }
      } catch (err) {
        // Error silenciado o manejado por UI en el futuro
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
              <div className="p-4 border-b border-foreground/5 bg-background/50  flex justify-between items-center">
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
