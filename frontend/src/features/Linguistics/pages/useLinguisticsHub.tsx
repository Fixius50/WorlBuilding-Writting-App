import { useState, useEffect, useRef, useCallback } from 'react';
import { useLexiconManager } from '../hooks/useLexiconManager';
import { useDrawingCanvas } from '../hooks/useDrawingCanvas';
import { useFontExporter } from '../hooks/useFontExporter';
import { Word } from '@domain/models/database';
import { LogEntry, WRITING_SYSTEM_TYPES } from '@domain/models/linguistics';

/**
 * 🧠 useLinguisticsHub
 * Logic for managing lexicon, drawing glyphs, and font exporting.
 */
export const useLinguisticsHub = (projectParam?: string) => {
  const { 
    lexicon, rules, activeLangId, langName, stats, foundryGlyphs, 
    loadData, saveWord, deleteWord 
  } = useLexiconManager(projectParam);

  const {
    layers, setLayers, activeLayerId, setActiveLayerId,
    selectedShapeId, setSelectedShapeId,
    tool, setTool, strokeWidth, setStrokeWidth,
    color, setColor, opacity, setOpacity,
    lineCap, setLineCap, strokeStyle, setStrokeStyle,
    stageRef, undo, redo, handleDrawEnd, handleChangeShape,
    openEditor, generateSVGAndCenteredLayers
  } = useDrawingCanvas();

  const [fontName, setFontName] = useState('CHRONOS_ATLAS_V1');
  const { exportFont } = useFontExporter(fontName);

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

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-4), { msg, type }]);
  }, []);

  const [writingSystem, setWritingSystem] = useState<string>(WRITING_SYSTEM_TYPES.ALPHABET.id);
  const [composerText, setComposerText] = useState('');
  const [composerGlyphs, setComposerGlyphs] = useState<Partial<Word>[]>([]);
  const [sourceText, setSourceText] = useState('');
  const [renderOutput, setRenderOutput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Panel derecho eliminado: antes abría "Lingüística" en modo bulk.
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorMode(false);
    setSelectedShapeId(null);
  }, [setSelectedShapeId]);

  const handleSaveCurrentGlyph = useCallback(async () => {
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
  }, [generateSVGAndCenteredLayers, lexicon, editingWord, activeLangId, saveWord, addLog, handleCloseEditor]);

  const handleSaveMeaning = useCallback(async (updatedData: Word & { isNew?: boolean }) => {
    try {
      await saveWord(updatedData, editingWord?.id);
      addLog('Cambios guardados localmente', 'success');
      setIsMeaningModalOpen(false);
      setEditingWord(null);
    } catch (err) {
      addLog('Error al guardar cambios', 'error');
    }
  }, [saveWord, editingWord, addLog]);

  const handleConfirmDelete = useCallback(async () => {
    if (!wordToDelete) return;
    try {
      await deleteWord(wordToDelete);
      addLog('Palabra eliminada localmente', 'success');
      setIsDeleteModalOpen(false);
      setWordToDelete(null);
    } catch (err) {
      addLog('Error al eliminar palabra', 'error');
    }
  }, [deleteWord, wordToDelete, addLog]);

  const handleCreateNewGlyph = useCallback(() => {
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
  }, [activeLangId, openEditor]);

  const handleTranslate = useCallback((text: string) => {
    setSourceText(text);
    setRenderOutput(text.split('').map(c => c === ' ' ? ' ' : 'φ').join(''));
  }, []);

  const handleComposerChange = useCallback((text: string) => {
    setComposerText(text);
    const glyphs = text.split('').map(char => {
      const found = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
      return found || { lema: char, placeholder: true };
    });
    setComposerGlyphs(glyphs);
  }, [foundryGlyphs]);

  const handleSaveComposedWord = useCallback(async () => {
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
  }, [composerText, activeLangId, saveWord, addLog]);

  return {
    lexicon,
    rules,
    activeLangId,
    langName,
    stats,
    foundryGlyphs,
    layers,
    selectedShapeId,
    tool,
    color,
    strokeWidth,
    stageRef,
    centerView,
    setCenterView,
    searchTerm,
    setSearchTerm,
    isMeaningModalOpen,
    setIsMeaningModalOpen,
    editingWord,
    setEditingWord,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    wordToDelete,
    setWordToDelete,
    editorMode,
    setEditorMode,
    logs,
    composerText,
    composerGlyphs,
    sourceText,
    renderOutput,
    fileInputRef,
    handleCloseEditor,
    handleSaveCurrentGlyph,
    handleSaveMeaning,
    handleConfirmDelete,
    handleCreateNewGlyph,
    handleTranslate,
    handleComposerChange,
    handleSaveComposedWord,
    exportFont,
    openEditor,
    setSelectedShapeId,
    handleChangeShape,
    handleDrawEnd
  };
};
