import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { Entidad, Word } from '@domain/models/database';
import MonolithicPanel from '@atoms/MonolithicPanel';
import Button from '@atoms/Button';
import DrawingCanvas from '@presentation/organisms/editor/DrawingCanvas';
import ConfirmModal from '@organisms/ConfirmModal';
import { useRightPanelStore } from '@store/useRightPanelStore';
import { LogEntry, WRITING_SYSTEM_TYPES } from '@domain/models/linguistics';

// Custom Hooks
import { useLexiconManager } from '../hooks/useLexiconManager';
import { useDrawingCanvas } from '../hooks/useDrawingCanvas';
import { useFontExporter } from '../hooks/useFontExporter';

interface OutletContext {
  projectId: number;
}

interface LinguisticsHubProps {
  onOpenAdvanced?: () => void;
  onOpenEditor?: (word: unknown) => void;
}

const LinguisticsHub: React.FC<LinguisticsHubProps> = ({ onOpenAdvanced, onOpenEditor }) => {
  const { t } = useLanguage();
  const { projectName: projectParam } = useParams();
  const { openPanel, closePanel } = useRightPanelStore();

  // Lexicon Logic
  const { 
    lexicon, rules, activeLangId, langName, stats, foundryGlyphs, 
    loadData, saveWord, deleteWord 
  } = useLexiconManager(projectParam);

  // Drawing Logic
  const {
    layers, setLayers, activeLayerId, setActiveLayerId,
    selectedShapeId, setSelectedShapeId,
    tool, setTool, strokeWidth, setStrokeWidth,
    color, setColor, opacity, setOpacity,
    lineCap, setLineCap, strokeStyle, setStrokeStyle,
    stageRef, undo, redo, handleDrawEnd, handleChangeShape,
    openEditor, generateSVGAndCenteredLayers
  } = useDrawingCanvas();

  // Font Logic
  const [fontName, setFontName] = useState('CHRONOS_ATLAS_V1');
  const { exportFont } = useFontExporter(fontName);

  // Local UI State
  const [centerView, setCenterView] = useState('lexicon');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMeaningModalOpen, setIsMeaningModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<number | string | null>(null);
  const [editorMode, setEditorMode] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { msg: 'Inicializando Repositorio de Glifos...', type: 'info' },
    { msg: 'Diccionario Vinculado Completamente', type: 'success' }
  ]);

  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-4), { msg, type }]);
  };

  const [writingSystem, setWritingSystem] = useState<string>(WRITING_SYSTEM_TYPES.ALPHABET.id);
  const [composerText, setComposerText] = useState('');
  const [composerGlyphs, setComposerGlyphs] = useState<Partial<Word>[]>([]);
  const [sourceText, setSourceText] = useState('');
  const [renderOutput, setRenderOutput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openPanel('bulk', 0, 'Lingüística');
  }, [openPanel]);

  // Handlers
  const handleOpenMeaningEditor = (word: Word) => {
    setEditingWord(word);
    setIsMeaningModalOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorMode(false);
    setSelectedShapeId(null);
  };

  const handleSaveCurrentGlyph = async () => {
    const result = generateSVGAndCenteredLayers();
    if (!result) {
      addLog('No hay trazos para guardar', 'warning');
      return;
    }

    const { svgPath, centeredLayers } = result;
    const existingWord = lexicon.find((w: Word) => w.id === editingWord?.id);

    try {
      const wordToSave: Word & { isNew?: boolean } = {
        ...(existingWord || ({} as Word)),
        lema: existingWord?.lema || 'Nuevo Glifo',
        nombre: existingWord?.lema || 'Nuevo Glifo',
        categoriaGramatical: 'GLYPH',
        svgPathData: svgPath,
        rawEditorData: JSON.stringify(centeredLayers),
        definicion: existingWord?.definicion || '',
        descripcion: existingWord?.descripcion || '',
        project_id: existingWord?.project_id || 0,
        carpeta_id: existingWord?.carpeta_id || activeLangId || 0,
        slug: existingWord?.slug || '',
        folder_slug: existingWord?.folder_slug || null,
        imagen_url: existingWord?.imagen_url || null,
        fecha_creacion: existingWord?.fecha_creacion || new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        borrado: existingWord?.borrado || 0,
        tipo: 'Word',
        isNew: !existingWord
      };

      await saveWord(wordToSave, editingWord?.id);
      addLog('Glifo guardado localmente', 'success');
      handleCloseEditor();
    } catch (err) {
      addLog('Error al guardar glifo', 'error');
    }
  };

  const handleSaveMeaning = async (updatedData: Word & { isNew?: boolean }) => {
    try {
      await saveWord(updatedData, editingWord?.id);
      addLog('Cambios guardados localmente', 'success');
      setIsMeaningModalOpen(false);
      setEditingWord(null);
    } catch (err) {
      addLog('Error al guardar cambios', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;
    try {
      await deleteWord(wordToDelete);
      addLog('Palabra eliminada localmente', 'success');
      setIsDeleteModalOpen(false);
      setWordToDelete(null);
    } catch (err) {
      addLog('Error al eliminar palabra', 'error');
    }
  };

  const handleCreateNewGlyph = () => {
    const tempWord: Word = {
      id: Date.now(),
      lema: 'Nuevo Glifo',
      nombre: 'Nuevo Glifo',
      categoriaGramatical: 'GLYPH',
      definicion: '',
      descripcion: '',
      project_id: 0,
      carpeta_id: activeLangId || 0,
      slug: '',
      folder_slug: null,
      imagen_url: null,
      contenido_json: '{}',
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      borrado: 0,
      tipo: 'Word'
    };
    setEditingWord(tempWord);
    openEditor(tempWord);
    setEditorMode(true);
  };

  const handleTranslate = (text: string) => {
    setSourceText(text);
    // Simple mock logic for translation output
    setRenderOutput(text.split('').map(c => c === ' ' ? ' ' : 'φ').join(''));
  };

  const handleComposerChange = (text: string) => {
    setComposerText(text);
    // Mocking finding glyphs for characters
    const glyphs = text.split('').map(char => {
      const found = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
      return found || { lema: char, placeholder: true };
    });
    setComposerGlyphs(glyphs);
  };

  const handleSaveComposedWord = async () => {
    if (!composerText || !activeLangId) return;
    const newWord: Word & { isNew?: boolean } = {
      id: Date.now(),
      lema: composerText,
      nombre: composerText,
      definicion: 'Palabra compuesta',
      descripcion: 'Palabra compuesta',
      categoriaGramatical: 'Noun',
      project_id: 0,
      carpeta_id: activeLangId,
      slug: composerText.toLowerCase().replace(/\s+/g, '-'),
      folder_slug: null,
      imagen_url: null,
      contenido_json: JSON.stringify({ source: 'composer' }),
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      borrado: 0,
      tipo: 'Word',
      isNew: true
    };
    await saveWord(newWord);
    setComposerText('');
    setComposerGlyphs([]);
    addLog('Palabra compuesta guardada', 'success');
  };

  const handleImportGlyphClick = () => fileInputRef.current?.click();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLog(`Importando ${file.name}...`, 'info');
    // Mocking SVG import logic
    setTimeout(() => addLog('Importación exitosa (Mock)', 'success'), 1000);
  };

  // Filter Lexicon
  const filteredLexicon = lexicon.filter(item => {
    const search = searchTerm.toLowerCase();
    const lema = (item.lema || '').toLowerCase();
    const def = (item.traduccionEspanol || item.definicion || '').toLowerCase();
    return lema.includes(search) || def.includes(search);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground/60 font-sans overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".svg" className="hidden" />

      {/* Minimal Navigation Bar */}
      <div className="h-16 border-b border-foreground/10 flex items-center justify-between px-8 bg-background/40">
        <div className="flex items-center gap-4"></div>

        {!editorMode && (
          <div className="absolute left-1/2 -translate-x-1/2 flex bg-foreground/5 p-1 rounded-none border border-foreground/10 ">
            {[
              { id: 'lexicon', label: t('linguistics.lexicon') },
              { id: 'translator', label: t('linguistics.translator') },
              { id: 'diccionario', label: 'DICCIONARIO' },
              { id: 'advanced', label: 'LABORATORIO', onClick: onOpenAdvanced }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={tab.onClick || (() => setCenterView(tab.id))}
                className={`px-6 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${centerView === tab.id ? 'bg-primary text-foreground shadow-lg' : 'text-foreground/60 hover:text-foreground/60'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {editorMode && (
          <div className="flex items-center gap-3 bg-foreground/5 p-1 rounded-none border border-foreground/10">
            <button
              onClick={handleCloseEditor}
              className="flex items-center gap-2 px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Descartar
            </button>
            <div className="w-px h-4 bg-foreground/10 mx-1"></div>
            <button
              onClick={handleSaveCurrentGlyph}
              className="flex items-center gap-2 px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest bg-primary text-foreground shadow-lg hover:shadow-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              Aplicar y Guardar
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 relative flex flex-col">
        {editorMode ? (
          <div className="flex-1 flex flex-col h-full relative">
            <DrawingCanvas
              stageRef={stageRef}
              layers={layers}
              selectedShapeId={selectedShapeId}
              onSelectShape={setSelectedShapeId}
              onChangeShape={handleChangeShape}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              onDrawEnd={handleDrawEnd}
            />
          </div>
        ) : centerView === 'lexicon' ? (
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="space-y-8">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black text-foreground tracking-tight italic">{t('linguistics.lexicon')}</h3>
                  <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">{stats.words} Palabras Mapeadas</p>
                </div>
                <Button variant="primary" size="md" onClick={handleCreateNewGlyph} icon="draw">Nuevo Glifo</Button>
              </div>

              <MonolithicPanel className="p-0 border-foreground/10 monolithic-panel/40 overflow-hidden shadow-2xl rounded-[2.5rem]">
                <div className="p-6 border-b border-foreground/10 flex items-center gap-4 bg-background/20">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg">search</span>
                    <input
                      type="text"
                      placeholder={t('linguistics.search_lexicon')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full monolithic-panel rounded-none py-4 pl-12 pr-4 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder-slate-600"
                    />
                  </div>
                  <button className="size-12 rounded-none monolithic-panel flex items-center justify-center text-foreground/60 hover:text-foreground transition-all hover:bg-foreground/10">
                    <span className="material-symbols-outlined text-xl">tune</span>
                  </button>
                </div>

                <div className="p-8 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar custom-scrollbar">
                  {filteredLexicon.map(item => (
                    <LexiconItem
                      key={item.id}
                      word={item.lema || item.palabraOriginal || ''}
                      type={item.categoriaGramatical}
                      gender={item.genero}
                      def={item.definicion || item.traduccionEspanol || ''}
                      onEdit={() => handleOpenMeaningEditor(item)}
                      onDelete={() => { setWordToDelete(item.id); setIsDeleteModalOpen(true); }}
                    />
                  ))}
                </div>
              </MonolithicPanel>
            </section>
          </div>
        ) : centerView === 'translator' ? (
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <span className="material-symbols-outlined text-primary text-4xl">sync_alt</span>
                <h3 className="text-3xl font-black text-foreground tracking-tight italic">{t('linguistics.translator')}</h3>
              </div>
              <MonolithicPanel className="p-12 border-primary/20 bg-primary/5 rounded-[3rem]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <textarea
                    value={sourceText}
                    onChange={(e) => handleTranslate(e.target.value)}
                    placeholder={t('linguistics.source_text')}
                    className="w-full h-48 monolithic-panel rounded-[2.5rem] p-8 text-lg font-bold text-foreground resize-none"
                  />
                  <div className="h-48 rounded-[2.5rem] monolithic-panel flex items-center justify-center overflow-hidden">
                    <span className="text-7xl font-serif text-foreground opacity-40">
                      {renderOutput || 'α β δ γ'}
                    </span>
                  </div>
                </div>
              </MonolithicPanel>
            </section>
          </div>
        ) : (
          <section className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col gap-12">
            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col"></div>
              <div className="px-6 py-2 rounded monolithic-panel border border-foreground/10 text-[10px] font-bold text-foreground/80 uppercase tracking-widest">
                Compilador Preparado
              </div>
            </div>

            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="size-2 bg-primary rounded-full"></div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/80">Inventario de Símbolos</h3>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-2.5 rounded-none bg-background/40 border border-primary/10 ">
                    <span className="text-[10px] font-bold text-primary/40">{foundryGlyphs.length} Símbolos Indexados</span>
                  </div>
                </div>
                <div className="p-10 rounded-[2.5rem] border border-primary/10 bg-primary/[0.02] grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                  {foundryGlyphs.map((g, i) => (
                    <GlyphSlot
                      key={g.id || i}
                      symbol={g.lema}
                      svgPath={g.svgPathData}
                      keyLabel={g.lema.length === 1 && g.lema.match(/[a-z]/i) ? g.lema.toUpperCase() : ''}
                      active={false}
                      onClick={() => { setEditingWord(g); openEditor(g); setEditorMode(true); }}
                    />
                  ))}
                  <button onClick={handleCreateNewGlyph} className="aspect-square border-2 border-dashed border-primary/10 flex items-center justify-center text-primary/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-3xl">draw</span>
                  </button>
                  <button onClick={handleImportGlyphClick} className="aspect-square border-2 border-dashed border-primary/10 flex items-center justify-center text-primary/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="size-2 bg-primary rounded-full opacity-60"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-primary/60">Compositor de Palabras</h3>
                </div>
                <MonolithicPanel className="p-10 border-foreground/10 bg-background/40 rounded-[2.5rem] space-y-8">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => handleComposerChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComposedWord(); }}
                    placeholder="Escribe para componer..."
                    className="w-full monolithic-panel rounded-none py-6 px-8 text-2xl font-bold outline-none"
                  />
                  <div className="min-h-32 p-8 rounded-none monolithic-panel flex flex-wrap gap-4 items-center justify-center">
                    {composerGlyphs.map((cg, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className={`text-5xl font-serif ${cg.placeholder ? 'text-foreground/60' : 'text-primary'}`}>{cg.lema}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">{cg.lema}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => exportFont(foundryGlyphs)}>Exportar Fuente TTF</Button>
                </MonolithicPanel>
              </section>
            </div>
          </section>
        )}
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Palabra"
        message="¿Estás seguro de que quieres eliminar esta palabra?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {isMeaningModalOpen && (
        <MeaningEditorModal
          word={editingWord}
          onClose={() => setIsMeaningModalOpen(false)}
          onSave={handleSaveMeaning}
          onEditSymbol={(word) => {
            setIsMeaningModalOpen(false);
            openEditor(word);
            setEditorMode(true);
          }}
        />
      )}
    </div>
  );
};

// Subcomponents
const LexiconItem: React.FC<{
  word: string;
  type: string;
  gender?: string;
  def: string;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ word, type, gender, def, onEdit, onDelete }) => (
  <div className="p-4 border border-transparent hover:bg-foreground/5 hover:border-foreground/10 transition-all group cursor-pointer relative">
    <div className="flex items-center gap-3 mb-1">
      <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{word}</h4>
      <div className="flex gap-2">
        <span className="text-[9px] font-bold text-foreground/60 italic">{type}</span>
        {gender && <span className="text-[9px] font-bold text-foreground/60 uppercase">({gender})</span>}
      </div>
    </div>
    <p className="text-sm text-foreground/60 line-clamp-2 pr-16">{def}</p>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
      <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="opacity-0 group-hover:opacity-100 p-2 text-primary"><span className="material-symbols-outlined">edit</span></button>
      <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-400"><span className="material-symbols-outlined">delete</span></button>
    </div>
  </div>
);

const GlyphSlot: React.FC<{
  symbol?: string;
  svgPath?: string;
  keyLabel?: string;
  active: boolean;
  onClick?: () => void;
}> = ({ symbol, svgPath, keyLabel, active, onClick }) => (
  <div onClick={onClick} className={`aspect-square border transition-all cursor-pointer flex items-center justify-center relative group overflow-hidden ${active ? 'border-primary' : 'border-primary/10 hover:border-primary/40'}`}>
    {svgPath ? (
      <svg viewBox="0 0 1200 800" className="w-[80%] h-[80%]">
        <path d={svgPath} fill="none" stroke="white" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-primary" />
      </svg>
    ) : (
      <span className={`text-4xl font-serif ${symbol ? 'text-primary' : 'opacity-20'}`}>{symbol || '?'}</span>
    )}
    {keyLabel && <span className="absolute top-2 right-3 text-[8px] font-black opacity-20">{keyLabel}</span>}
  </div>
);

const MeaningEditorModal: React.FC<{
  word: Word | null;
  onClose: () => void;
  onSave: (data: Word & { isNew?: boolean }) => void;
  onEditSymbol: (word: Word) => void;
}> = ({ word, onClose, onSave, onEditSymbol }) => {
  const [data, setData] = useState({
    lema: word?.lema || '',
    definicion: word?.definicion || '',
    categoriaGramatical: word?.categoriaGramatical || 'Noun',
    isNew: word?.isNew
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60">
      <div className="w-full max-w-lg monolithic-panel rounded-[2.5rem] overflow-hidden bg-background">
        <div className="p-8 border-b border-foreground/10 flex justify-between items-center">
          <h2 className="text-xl font-black italic">Editar Significado</h2>
          <button onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-8 space-y-6">
          <input value={data.lema} onChange={e => setData(d => ({ ...d, lema: e.target.value }))} className="w-full monolithic-panel p-4" placeholder="Palabra" />
          <select value={data.categoriaGramatical} onChange={e => setData(d => ({ ...d, categoriaGramatical: e.target.value }))} className="w-full monolithic-panel p-4 bg-background">
            <option value="Noun">Sustantivo</option>
            <option value="Verb">Verbo</option>
            <option value="Adj">Adjetivo</option>
            <option value="GLYPH">Glifo</option>
          </select>
          <textarea value={data.definicion} onChange={e => setData(d => ({ ...d, definicion: e.target.value }))} className="w-full monolithic-panel p-4 h-24" placeholder="Significado" />
          <Button variant="outline" className="w-full" onClick={() => word && onEditSymbol(word)}>Editar Símbolo</Button>
        </div>
        <div className="p-8 border-t border-foreground/10 flex gap-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" className="flex-1" onClick={() => word && onSave({ ...word, ...data })}>Guardar</Button>
        </div>
      </div>
    </div>
  );
};

export default LinguisticsHub;
