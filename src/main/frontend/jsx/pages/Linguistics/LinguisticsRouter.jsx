import React, { useState } from 'react';
import LinguisticsHub from './LinguisticsHub';
import GlyphFoundry from './GlyphFoundry';
import SymbologyEditor from './SymbologyEditor';
import api from '../../../js/services/api';

const LinguisticsRouter = () => {
    const [view, setView] = useState('hub'); // 'hub', 'foundry', 'editor'
    const [selectedWord, setSelectedWord] = useState(null);

    const handleOpenEditor = (word) => {
        setSelectedWord(word);
        setView('editor');
    };

    const handleSaveGlyph = async (saveData) => {
        if (saveData.wordId) {
            try {
                // Find language ID first (Hub usually knows it, but Router needs to track it or we use a global approach)
                // For now, let's assume we can get it from the word itself if it was loaded
                // Actually, the endpoint I added is /api/conlang/{id}/palabra/{palabraId}/glyph
                // But the palabraId is unique globally anyway in JPA if we use a flat structure for word updates
                // Let's refine the endpoint to not need the {id} if palabraId is enough.
                // Wait, Word has a ManyToOne back to Conlang.

                // For simplicity, let's use a flatter endpoint or just pass 0 as conlangId if we don't need it.
                await api.patch(`/conlang/0/palabra/${saveData.wordId}/glyph`, {
                    svgPathData: saveData.svgPathData
                });
                console.log("Glyph saved successfully");
            } catch (err) {
                console.error("Error saving glyph:", err);
            }
        }
        setSelectedWord(null);
        setView('hub');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050508] overflow-hidden">
            {view === 'hub' && (
                <LinguisticsHub onOpenEditor={handleOpenEditor} />
            )}

            {view === 'editor' && (
                <SymbologyEditor
                    word={selectedWord}
                    onBack={() => setView('hub')}
                    onSave={handleSaveGlyph}
                />
            )}
        </div>
    );
};

export default LinguisticsRouter;
