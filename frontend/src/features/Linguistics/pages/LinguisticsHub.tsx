import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams } from 'react-router-dom';
import Konva from 'konva';
import { useLanguage } from '@context/LanguageContext';
import { Entidad, Word } from '@domain/models/database';
import GlassPanel from '@atoms/GlassPanel';
import Avatar from '@atoms/Avatar';
import Button from '@atoms/Button';
import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';
import { Font as OpentypeFont, Glyph as OpentypeGlyph, Path as OpentypePath } from 'opentype.js';
import UniversalCanvas from '@organisms/editor/UniversalCanvas';
import UniversalCanvasProperties from '@organisms/editor/UniversalCanvasProperties';
import ConfirmModal from '@organisms/ConfirmModal';
import LinguisticsSidebar, { GrammarRule } from '../components/LinguisticsSidebar';
import { Shape, LayerData } from '@domain/models/canvas';
import { LogEntry, WritingSystemType, WRITING_SYSTEM_TYPES } from '@domain/models/linguistics';

interface OutletContext {
 setRightPanelTab: (tab: string) => void;
 setRightOpen: (open: boolean) => void;
 setRightPanelTitle: (title: React.ReactNode) => void;
 setRightPanelContent: (content: React.ReactNode) => void;
}

interface LinguisticsHubProps {
  onOpenEditor?: (glyph: Word) => void;
  onOpenAdvanced?: () => void;
}

const LinguisticsHub: React.FC<LinguisticsHubProps> = ({ onOpenEditor, onOpenAdvanced }) => {
 const { t } = useLanguage();
 const { projectName: projectParam } = useParams();
 const { setRightPanelTab, setRightOpen } = useOutletContext<OutletContext>(); 
 const [projectName, setProjectName] = useState('...');
 const [stats, setStats] = useState({ words: 0, rules: 0, glyphs: 0 });
 const [langName, setLangName] = useState('...');
 const [lexicon, setLexicon] = useState<Word[]>([]);
 const [rules, setRules] = useState<GrammarRule[]>([]);
 const [activeLangId, setActiveLangId] = useState<number | null>(null);
 const [sourceText, setSourceText] = useState('');
 const [renderOutput, setRenderOutput] = useState('');
 const [isMounted, setIsMounted] = useState(false);

 // Navigation States
 const [centerView, setCenterView] = useState('lexicon');
 const [searchTerm, setSearchTerm] = useState('');
 const [sidebarTab, setSidebarTab] = useState('MANAGEMENT');
 const [isMeaningModalOpen, setIsMeaningModalOpen] = useState(false);
 const [editingWord, setEditingWord] = useState<Word | null>(null);
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [wordToDelete, setWordToDelete] = useState<number | string | null>(null);

 const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

 const [fontName, setFontName] = useState('CHRONOS_ATLAS_V1');
 const [fontAuthor, setFontAuthor] = useState('ARCHITECT_ID');
 const [fontFormat, setFontFormat] = useState('TTF');
 const [fontLigatures, setFontLigatures] = useState(true);
 const [fontKerning, setFontKerning] = useState(true);

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
 const [foundryGlyphs, setFoundryGlyphs] = useState<Word[]>([]);

 const [editorMode, setEditorMode] = useState(false);
 const [activeGlyphId, setActiveGlyphId] = useState<number | string | null>(null);
  const [layers, setLayers] = useState<LayerData[]>([
    { id: 'layer1', name: 'Trazo Principal', visible: true, locked: false, shapes: [] },
    { id: 'layer2', name: 'Guías', visible: true, locked: false, shapes: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer1');
  const [selectedShapeId, setSelectedShapeId] = useState<string | string[] | null>(null);

  const [past, setPast] = useState<LayerData[][]>([]);
  const [future, setFuture] = useState<LayerData[][]>([]);

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [layers, ...prev]);
    setPast(newPast);
    setLayers(previous);
  };

  const pushToHistory = (newLayers: LayerData[]) => {
    const snapshot = JSON.parse(JSON.stringify(newLayers));
    setPast(prev => [...prev.slice(-19), snapshot]);
    setFuture([]);
  };

 const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, layers]);
    setFuture(newFuture);
    setLayers(next);
 };

 const [tool, setTool] = useState('brush');
 const [strokeWidth, setStrokeWidth] = useState(4);
 const [color, setColor] = useState('hsl(var(--primary))');
 const [opacity, setOpacity] = useState(1);
 const [lineCap, setLineCap] = useState('round');
 const [strokeStyle, setStrokeStyle] = useState('linear');

  const stageRef = React.useRef<Konva.Stage | null>(null);

 // Utility placeholders for missing definitions
 const setRightPanelMode = (mode: string) => {
 console.log("Setting panel mode to:", mode);
 // Implement logic if needed or pass via context
 };

 const projectId = activeLangId; // Local fallback or get from context/params

  const loadRules = async (langId: number, allEntities: Entidad[]) => {
    const langRules: GrammarRule[] = allEntities
      .filter(e => (e.tipo === 'Rule' || e.tipo === 'Regla') && e.carpeta_id === langId)
      .map(r => {
        const data = JSON.parse(r.contenido_json || '{}');
        return {
          id: r.id,
          titulo: data.titulo || r.nombre || 'Sin título',
          descripcion: data.contenido || r.descripcion || '',
          status: data.status || 'draft'
        };
      });
    setRules(langRules);
  };

 const loadLexicon = async (langId: number, allEntities: Entidad[]) => {
 const langWords = allEntities.filter(e => 
 (e.tipo === 'Word' || e.tipo === 'Palabra') && e.carpeta_id === langId
 ).map(w => ({ ...w, ...JSON.parse(w.contenido_json || '{}') }));
 setLexicon(langWords);
 setFoundryGlyphs(langWords.filter((item: Word) =>
 ['GLYPH', 'GLYFO', 'GLIFO'].includes(item.categoriaGramatical) ||
 (item.svgPathData && item.lema?.length === 1)
 ));
 };

 const loadData = async () => {
 try {
 const entities = await entityService.getAllByProject(Number(projectParam ?? '0') || 0);
 const langs = entities.filter(e => e.tipo === 'Conlang');
 if (langs.length > 0) {
 const active = langs[0];
 setActiveLangId(active.id);
 setLangName(active.nombre);
 
 const children = await entityService.getByFolder(active.id);
 loadLexicon(active.id, children);
 loadRules(active.id, children);
 
 const words = children.filter(e => e.tipo === 'Word');
 setStats({ words: words.length, rules: 0, glyphs: words.filter(e => {
 const data = JSON.parse(e.contenido_json ?? '{}');
 return data.svgPathData;
 }).length });
 }
 } catch (err) {
 console.error("Load error:", err);
 }
 };

 useEffect(() => {
 loadData();
 setRightOpen(true);
 if (setRightPanelTab) setRightPanelTab('CONTEXT'); // Updated Mode
 setIsMounted(true);

 // Find Portal
 const interval = setInterval(() => {
 const el = document.getElementById('global-right-panel-portal');
 if (el) {
 console.log('[LinguisticsHub] Portal found, clearing before use');
 el.innerHTML = ''; // Clear any residual content from other components
 setPortalTarget(el);
 clearInterval(interval);
 }
 }, 100);

 return () => {
 clearInterval(interval);
 console.log('[LinguisticsHub] Cleanup: clearing portal');
 const el = document.getElementById('global-right-panel-portal');
 if (el) el.innerHTML = '';
 if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
 };
 }, []);

 // Apply stroke style to selected shape when strokeStyle changes
 useEffect(() => {
 if (!selectedShapeId || Array.isArray(selectedShapeId)) return;

 setLayers(prev => {
 const newLayers = prev.map(layer => ({
 ...layer,
 shapes: layer.shapes.map(shape => {
 if (shape.id === selectedShapeId && (shape.type === 'line' || shape.type === 'brush')) {
 const updated = { ...shape };
 if (strokeStyle === 'points') {
 updated.dash = [2, 10];
 delete updated.tension;
 } else if (strokeStyle === 'quadratic') {
 updated.tension = 0.8;
 delete updated.dash;
 } else {
 delete updated.dash;
 delete updated.tension;
 }
 return updated;
 }
 return shape;
 })
 }));
 pushToHistory(newLayers);
 return newLayers;
 });
 }, [strokeStyle]);

 // --- PROPERTY PROPAGATION LISTENERS ---
 // Update selected shapes when properties change
 useEffect(() => {
 if (!selectedShapeId || (Array.isArray(selectedShapeId) && selectedShapeId.length === 0)) return;

 setLayers(prev => {
 const newLayers = prev.map(layer => ({
 ...layer,
 shapes: layer.shapes.map(shape => {
 const isSelected = Array.isArray(selectedShapeId)
 ? selectedShapeId.includes(shape.id)
 : shape.id === selectedShapeId;

 if (isSelected) {
 return {
 ...shape,
 stroke: color,
 strokeWidth: strokeWidth,
 opacity: opacity,
 lineCap: lineCap as 'round' | 'butt' | 'square'
 };
 }
 return shape;
 })
 }));
 // We don't push to history here to avoid spamming undo stack on slider drag
 // Optional: Debounce history push or push only on mouse up of slider
 return newLayers;
 });
 }, [color, strokeWidth, opacity, lineCap]);

 // --- EDITOR HANDLERS ---
 const handleOpenEditor = (glyph: Word) => {
 setActiveGlyphId(glyph.id);
 setEditorMode(true);
 setRightPanelMode('LINGUISTICS');

 if (glyph.rawEditorData) {
 try {
 const savedLayers = JSON.parse(glyph.rawEditorData);
 if (Array.isArray(savedLayers) && savedLayers.length > 0) {
 setLayers(savedLayers);
 setActiveLayerId(savedLayers[0].id);
 return;
 }
 } catch (err) {
 console.error("Error parsing rawEditorData:", err);
 }
 }

 const initialShapes = [];
 if (glyph.svgPathData) {
 initialShapes.push({
 id: crypto.randomUUID(),
 type: 'path',
 data: glyph.svgPathData,
 x: 0,
 y: 0,
 stroke: 'hsl(var(--primary))',
 strokeWidth: 2,
 fill: null,
 scaleX: 1,
 scaleY: 1
 });
 }

 setLayers([
 { id: 'layer1', name: 'Trazo Principal', visible: true, locked: false, shapes: initialShapes },
 { id: 'layer2', name: 'Guías', visible: true, locked: false, shapes: [] }
 ]);
 setActiveLayerId('layer1');
 };

 const handleCloseEditor = () => {
 setEditorMode(false);
 setActiveGlyphId(null);
 setSelectedShapeId(null);
 };

 const handleSaveCurrentGlyph = async () => {
 if (!activeGlyphId || !activeLangId) return;

 const allShapes = layers
 .filter(l => l.visible && !l.name.toLowerCase().includes('guía'))
 .flatMap(l => l.shapes);

 if (allShapes.length === 0) {
 addLog('No hay trazos para guardar', 'warning');
 return;
 }

 // --- SVG GENERATION UPDATE ---
 // Helper to append shapes to SVG path
 let svgPath = "";

 // BBox calculation code follows...
 let minX = Infinity, minY = Infinity, maxY = -Infinity, maxX = -Infinity;
 const computeBBox = (shape: Shape) => {
 const sx = shape.x || 0;
 const sy = shape.y || 0;
 if (shape.type === 'line' && shape.points) {
 for (let i = 0; i < shape.points.length; i += 2) {
 const x = (shape.points[i] || 0) + sx;
 const y = (shape.points[i + 1] || 0) + sy;
 minX = Math.min(minX, x); minY = Math.min(minY, y);
 maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
 }
 } else if (shape.type === 'rect') {
 minX = Math.min(minX, sx); minY = Math.min(minY, sy);
 maxX = Math.max(maxX, sx + (shape.width || 0)); maxY = Math.max(maxY, sy + (shape.height || 0));
 } else if (shape.type === 'circle') {
 const r = shape.radius || 0;
 minX = Math.min(minX, sx - r); minY = Math.min(minY, sy - r);
 maxX = Math.max(maxX, sx + r); maxY = Math.max(maxY, sy + r);
 }
 };

 allShapes.forEach(computeBBox);

 if (minX === Infinity) return;

 const centerX = (minX + maxX) / 2;
 const centerY = (minY + maxY) / 2;
 const stage = stageRef.current;
 if (!stage) return;
 const offsetX = (stage.width() / 2) - centerX;
 const offsetY = (stage.height() / 2) - centerY;

 const centeredLayers = layers.map(l => ({
 ...l,
 shapes: l.shapes.map(s => ({
 ...s,
 x: (s.x || 0) + offsetX,
 y: (s.y || 0) + offsetY
 }))
 }));

 // Generate SVG Path for all shapes (Lines, Rects, Circles)
 allShapes.forEach(s => {
 const ox = (s.x || 0) + offsetX;
 const oy = (s.y || 0) + offsetY;

 if (s.type === 'line' && s.points && s.points.length >= 4) {
 if (s.globalCompositeOperation === 'destination-out') return; // Skip eraser strokes in SVG
 svgPath += `M ${s.points[0] + ox} ${s.points[1] + oy} `;
 for (let i = 2; i < s.points.length; i += 2) {
 svgPath += `L ${s.points[i] + ox} ${s.points[i + 1] + oy} `;
 }
 } else if (s.type === 'rect') {
 const w = s.width || 0;
 const h = s.height || 0;
 // M x y L x+w y L x+w y+h L x y+h Z
 svgPath += `M ${ox} ${oy} L ${ox + w} ${oy} L ${ox + w} ${oy + h} L ${ox} ${oy + h} Z `;
 } else if (s.type === 'circle') {
 const r = s.radius || 0;
 // Circle using two arcs
 // M cx cy-r A r r 0 1 0 cx cy+r A r r 0 1 0 cx cy-r
 // Note: opentype.js might prefer Cubic Beziers, but let's try Arcs first. 
 // If fails, we might need a polyline approximation or Bezier conversion.
 // Simple approximation: 4 cubic beziers.
 const k = 0.5522847498 * r;
 svgPath += `M ${ox} ${oy - r}
 C ${ox + k} ${oy - r} ${ox + r} ${oy - k} ${ox + r} ${oy}
 C ${ox + r} ${oy + k} ${ox + k} ${oy + r} ${ox} ${oy + r}
 C ${ox - k} ${oy + r} ${ox - r} ${oy + k} ${ox - r} ${oy}
 C ${ox - r} ${oy - k} ${ox - k} ${oy - r} ${ox} ${oy - r} Z `;
 }
 });

 try {
 const existingWord = lexicon.find((w: Word) => w.id === activeGlyphId);

 const entityData: Omit<Entidad, 'id' | 'fecha_creacion'> = {
   nombre: existingWord?.lema || 'Nuevo Glifo',
   tipo: 'Word',
   project_id: Number(projectParam) || 0,
   carpeta_id: activeLangId!,
   contenido_json: JSON.stringify({
     ...(existingWord || {}),
     lema: existingWord?.lema || 'Nuevo Glifo',
     categoriaGramatical: 'GLYPH',
     svgPathData: svgPath,
     rawEditorData: JSON.stringify(centeredLayers)
   }),
   descripcion: existingWord?.definicion || '',
   slug: '',
   folder_slug: null,
   imagen_url: null,
   fecha_actualizacion: '',
   borrado: 0
 };

 if (existingWord) {
 await entityService.update(Number(activeGlyphId), entityData);
 } else {
 await entityService.create(entityData);
 }

 loadData(); // Use unified loadData
 addLog('Glifo guardado localmente', 'success');
 } catch (err) {
 console.error("Error saving glyph:", err);
 addLog('Error al guardar glifo', 'error');
 throw err;
 }
 };

 const handleDeleteWord = (id: number | string) => {
 setWordToDelete(id);
 setIsDeleteModalOpen(true);
 };

 const confirmDeleteWord = async () => {
 if (!wordToDelete || !activeLangId) return;
 try {
 await entityService.delete(Number(wordToDelete));
 loadData();
 addLog('Palabra eliminada localmente', 'success');
 setWordToDelete(null);
 setIsDeleteModalOpen(false);
 } catch (err) {
 console.error("Error deleting word:", err);
 addLog('Error al eliminar palabra', 'error');
 }
 };

 const handleOpenMeaningEditor = (word: Word) => {
 setEditingWord(word);
 setIsMeaningModalOpen(true);
 };

 const handleSaveMeaning = async (updatedData: Word & { isNew?: boolean }) => {
 if (!activeLangId || !projectId) return;
 try {
 const entityData: Omit<Entidad, 'id' | 'fecha_creacion'> = {
   nombre: updatedData.lema,
   tipo: 'Word',
   project_id: Number(projectParam) || 0,
   carpeta_id: activeLangId!,
   descripcion: updatedData.definicion || '',
   contenido_json: JSON.stringify(updatedData),
   slug: '',
   folder_slug: null,
   imagen_url: null,
   fecha_actualizacion: '',
   borrado: 0
 };

 if (updatedData.isNew) {
 await entityService.create(entityData);
 } else {
 await entityService.update(Number(editingWord!.id), entityData);
 }
 loadData();
 addLog('Cambios guardados localmente', 'success');
 setIsMeaningModalOpen(false);
 setEditingWord(null);
 } catch (err) {
 console.error("Error saving meaning:", err);
 addLog('Error al guardar cambios', 'error');
 }
 };



 // Filter Lexicon based on searchTerm
 const filteredLexicon = lexicon.filter(item => {
 const search = searchTerm.toLowerCase();
 const lema = (item.lema || '').toLowerCase();
 const def = (item.traduccionEspanol || item.definicion || '').toLowerCase();
 return lema.includes(search) || def.includes(search);
 });
 const handleDrawEnd = (phase: string, data: any) => {
 // Handle drawing logic updates to layers state
 if (phase === 'START') {
 // LAYER LOCK CHECK:
 const activeLayer = layers.find(l => l.id === activeLayerId);
 if (!activeLayer || activeLayer.locked || !activeLayer.visible) {
 addLog('Capa bloqueada u oculta', 'warning');
 return;
 }

 // Create new shape in active layer
 const newShape: Shape = {
 id: crypto.randomUUID(),
 type: tool,
 stroke: color,
 strokeWidth: strokeWidth,
 opacity: opacity,
 lineCap: lineCap as 'round' | 'butt' | 'square',
 lineJoin: 'round',
 x: (tool === 'brush' || tool === 'eraser' || tool === 'line') ? 0 : data.pos.x,
 y: (tool === 'brush' || tool === 'eraser' || tool === 'line') ? 0 : data.pos.y,
 };

 if (tool === 'brush' || tool === 'eraser') {
 newShape.type = 'line';
 newShape.points = [data.pos.x, data.pos.y, data.pos.x, data.pos.y];
 if (tool === 'eraser') {
 newShape.globalCompositeOperation = 'destination-out';
 newShape.strokeWidth = strokeWidth * 2; // Eraser slightly bigger
 }
 if (strokeStyle === 'points' && tool !== 'eraser') newShape.dash = [2, 10];
 if (strokeStyle === 'quadratic' && tool !== 'eraser') newShape.tension = 0.8;
 } else if (tool === 'line') {
 newShape.type = 'line';
 newShape.points = [data.pos.x, data.pos.y, data.pos.x, data.pos.y];
 if (strokeStyle === 'points') newShape.dash = [2, 10];
 if (strokeStyle === 'quadratic') newShape.tension = 0.8;
 } else if (tool === 'rect') {
 newShape.width = 0;
 newShape.height = 0;
 if (strokeStyle === 'points') newShape.dash = [5, 5];
 } else if (tool === 'circle') {
 newShape.radius = 0;
 if (strokeStyle === 'points') newShape.dash = [5, 5];
 }

 setLayers(prev => {
 const newLayers = prev.map(l => {
 if (l.id === activeLayerId) {
 return { ...l, shapes: [...l.shapes, newShape] };
 }
 return l;
 });
 pushToHistory(newLayers);
 return newLayers;
 });
 setSelectedShapeId(newShape.id);
 } else if (phase === 'MOVE') {
 // Update last shape in active layer
    setLayers(prev => prev.map((l: LayerData) => {
 if (l.id === activeLayerId) {
 const shapes = [...l.shapes];
 if (shapes.length === 0) return l;
 const lastShape = { ...shapes[shapes.length - 1] };

 if (tool === 'brush' || tool === 'eraser') {
 lastShape.points = [...(lastShape.points || []), data.pos.x, data.pos.y];
 } else if (tool === 'line') {
 const px = lastShape.points ? lastShape.points[0] : (lastShape.x || 0);
 const py = lastShape.points ? lastShape.points[1] : (lastShape.y || 0);
 lastShape.points = [px, py, data.pos.x, data.pos.y];
 } else if (tool === 'rect') {
 lastShape.width = data.pos.x - (lastShape.x || 0);
 lastShape.height = data.pos.y - (lastShape.y || 0);
 } else if (tool === 'circle') {
 const dx = data.pos.x - (lastShape.x || 0);
 const dy = data.pos.y - (lastShape.y || 0);
 lastShape.radius = Math.sqrt(dx * dx + dy * dy);
 }

 shapes[shapes.length - 1] = lastShape;
 return { ...l, shapes };
 }
 return l;
 }));
 } else if (phase === 'END') {
 // Finalize history on draw end
 pushToHistory(layers);
 }
 };

 const handleCreateNewGlyph = () => {
 // Create a blank glyph
 const newGlyph = {
 id: crypto.randomUUID(),
 lema: 'Nuevo Glifo',
 shapes: []
 };
 // Mocking adding it to our local state or just opening editor for it
 setActiveGlyphId(newGlyph.id);
 const newLayerId = crypto.randomUUID();
 setLayers([
 { id: newLayerId, name: 'Capa 1', visible: true, locked: false, shapes: [] }
 ]);
 setActiveLayerId(newLayerId);
 setEditorMode(true);
 setRightPanelMode('LINGUISTICS');
 };

  const handleChangeShape = (id: string, newAttrs: Partial<Shape>) => {
    setLayers(prev => prev.map((l: LayerData) => ({
      ...l,
      shapes: l.shapes.map((s: Shape) => s.id === id ? { ...s, ...newAttrs } : s)
    })));
  };

 // Unified word creation handler
 const handleCreateNewWord = async () => {
 if (!activeLangId) return;
 setEditingWord({
  id: 'temp-' + Date.now(),
  lema: '',
  definicion: '',
  categoriaGramatical: 'Noun',
  isNew: true,
  nombre: '',
  tipo: 'Word',
  project_id: Number(projectParam) || 0,
  carpeta_id: activeLangId,
  descripcion: '',
  contenido_json: '{}',
  fecha_creacion: new Date().toISOString()
  } as any);
 setIsMeaningModalOpen(true);
 };

 const handleNewWord = async () => {
 if (!activeLangId || !projectId) return;
 const lema = prompt("Enter word (Lema):");
 if (!lema) return;
 const def = prompt("Enter definition:");
 const cat = prompt("Enter category (Noun, Verb, etc.):");

 try {
 await entityService.create({
   nombre: lema,
   tipo: 'Word',
   project_id: Number(projectParam) || 0,
   carpeta_id: activeLangId!,
   descripcion: def || '',
   contenido_json: JSON.stringify({
     lema,
     definicion: def,
     categoriaGramatical: cat
   }),
   slug: '',
   folder_slug: null,
   imagen_url: null
 });
 loadData();
 addLog('Palabra creada', 'success');
 } catch (err) {
 console.error("Error adding word:", err);
 addLog('Error al crear palabra', 'error');
 }
 };

 const handleAddRule = async () => {
 if (!activeLangId || !projectId) return;
 const titulo = prompt("Enter rule title:");
 if (!titulo) return;
 const contenido = prompt("Enter rule content:");

 try {
 await entityService.create({
   nombre: titulo,
   tipo: 'Rule',
   project_id: Number(projectParam) || 0,
   carpeta_id: activeLangId!,
   descripcion: contenido || '',
   contenido_json: JSON.stringify({
     titulo,
     contenido
   }),
   slug: '',
   folder_slug: null,
   imagen_url: null
 });
 loadData();
 addLog('Regla creada', 'success');
 } catch (err) {
 console.error("Error adding rule:", err);
 addLog('Error al crear regla', 'error');
 }
 };

 const handleTranslate = (text: string) => {
 setSourceText(text);

 // Dynamic translator: find glyphs in foundryGlyphs
 const mapped = text.split('').map(char => {
 const match = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
 return match ? match.lema : char; // We'll render SVG later in output if possible, or just the symbol
 }).join(' ');

 setRenderOutput(mapped);
 };

 const handleComposerChange = (text: string) => {
 setComposerText(text);
 const sequence = text.split('').map(char => {
 const glyph = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
 return glyph || { lema: char, placeholder: true };
 });
 setComposerGlyphs(sequence);
 };

 const handleSaveComposedWord = async () => {
 if (!activeLangId || !composerText || !projectId) return;

 try {
 await entityService.create({
   nombre: composerText,
   tipo: 'Word',
   project_id: Number(projectParam) || 0,
   carpeta_id: activeLangId!,
   descripcion: `Entrada automática (${new Date().toLocaleDateString()})`,
   contenido_json: JSON.stringify({
     lema: composerText,
     categoriaGramatical: 'COMPUESTA',
     definicion: `Entrada automática (${new Date().toLocaleDateString()})`
   }),
   slug: '',
   folder_slug: null,
   imagen_url: null
 });
 loadData();
 addLog(`Palabra "${composerText}" indexada automáticamente`, 'success');
 } catch (err) {
 console.error("Error al guardar automáticamente:", err);
 addLog('Error al guardar palabra compuesta', 'error');
 }
 };

 const getNextUnicodeCode = () => {
 const codes = foundryGlyphs
 .map(g => g.unicodeCode)
 .filter((c): c is string => !!c && c.startsWith('U+'))
 .map(c => parseInt(c.replace('U+', ''), 16));

 const nextVal = codes.length > 0 ? Math.max(...codes) + 1 : 0xE000;
 return `U+${nextVal.toString(16).toUpperCase()}`;
 };



 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleImportGlyphClick = () => {
 fileInputRef.current?.click();
 };

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = async (event) => {
 const text = event.target?.result;
 if (typeof text === 'string' && text.includes('<svg')) {
 const pathMatch = text.match(/<path[^>]*d="([^"]*)"/i);
 if (pathMatch && pathMatch[1]) {
 const svgPathData = pathMatch[1];
 const charName = file.name.replace('.svg', '');
 
 try {
 await entityService.create({
   nombre: charName,
   tipo: 'Word',
   project_id: projectId!,
   carpeta_id: activeLangId!,
   descripcion: 'Glifo importado',
   contenido_json: JSON.stringify({
     lema: charName,
     categoriaGramatical: 'GLYPH',
     svgPathData: svgPathData
   }),
   slug: '',
   folder_slug: null,
   imagen_url: null
 });
 loadData();
 addLog(`Glifo ${charName} importado`, 'success');
 } catch (err) {
 console.error("Error importing SVG:", err);
 addLog('Error al guardar glifo importado', 'error');
 }
 }
 } else {
 alert("SVG inválido para renderizado de glifos.");
 }
 };
 reader.readAsText(file);
 if (e.target) e.target.value = '';
 };

 const handleExportFont = async () => {
 if (!activeLangId || foundryGlyphs.length === 0) {
 alert("No hay glifos mapeados para exportar.");
 return;
 }

 addLog("Compilando fuente tipográfica...", "info");

 try {
 const font = new OpentypeFont({
 familyName: fontName || 'Atlas_Conlang',
 styleName: 'Regular',
 unitsPerEm: 1024,
 ascender: 800,
 descender: -200
 });

 const notdefGlyph = new OpentypeGlyph({
 name: '.notdef',
 unicode: 0,
 advanceWidth: 650,
 path: new OpentypePath()
 });
 font.glyphs.push(notdefGlyph);

 foundryGlyphs.forEach((g: Word) => {
 if (!g.svgPathData || !g.unicodeCode) return;
 const unicode = parseInt(g.unicodeCode.replace('U+', ''), 16);
 const path = new OpentypePath();
 const commands = g.svgPathData.match(/[a-df-z][^a-df-z]*/gi);
 if (commands) {
 commands.forEach((cmdStr: string) => {
 const type = cmdStr[0].toUpperCase();
 const args = cmdStr.slice(1).trim().split(/[\\s,]+/).map(parseFloat);
 if (type === 'M') path.moveTo(args[0], args[1]);
 else if (type === 'L') path.lineTo(args[0], args[1]);
 else if (type === 'C') path.curveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
 else if (type === 'Q') path.quadraticCurveTo(args[0], args[1], args[2], args[3]);
 else if (type === 'Z') path.close();
 });
 }

 const glyph = new OpentypeGlyph({
 name: `glyph_${g.unicodeCode}`,
 unicode: unicode,
 advanceWidth: 800,
 path: path
 });
 font.glyphs.push(glyph);
 });

 const buffer = font.toArrayBuffer();
 const blob = new Blob([buffer], { type: 'font/ttf' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${fontName}.ttf`;
 a.click();
 URL.revokeObjectURL(url);

 addLog("Fuente sincronizada con el sistema local", "success");
 alert("¡Fuente generada y descargada localmente con éxito!");
 } catch (err: unknown) {
 console.error("Error exportando fuente:", err);
 addLog("Error en compilación de fuente", "error");
 const errMsg = err instanceof Error ? err.message : String(err);
 alert("Error al generar la fuente: " + errMsg);
 }
 };

 return (
 <div className="flex-1 flex flex-col h-full bg-background text-foreground/60 font-sans overflow-hidden">
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileUpload}
 accept=".svg"
 className="hidden"
 />

 {/* Minimal Navigation Bar */}
 <div className="h-16 border-b border-foreground/10 flex items-center justify-between px-8 bg-background/40">
 <div className="flex items-center gap-4">
 {/* Header Info Hidden on User Request */}
 </div>

 {/* Unified Navigation Switcher - Centered absolutely */}
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

 {/* Editor Actions - Replace Switcher when editing */}
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
 onClick={async () => {
 await handleSaveCurrentGlyph();
 handleCloseEditor();
 }}
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
 /* KONVA EDITOR VIEW */
 <div className="flex-1 flex flex-col h-full relative">

 <UniversalCanvas
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

 {/* Floating Toolbar (Left) */}
 {/* Floating Toolbar MOVED to Right Panel */}
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

 <GlassPanel className="p-0 border-foreground/10 monolithic-panel/40 overflow-hidden shadow-2xl rounded-[2.5rem]">
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
 <button className="size-12 rounded-none monolithic-panel flex items-center justify-center text-foreground/60 hover:text-foreground transition-all hover:bg-foreground/10"><span className="material-symbols-outlined text-xl">tune</span></button>
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
 onDelete={() => handleDeleteWord(item.id)}
 />
 ))}
 {filteredLexicon.length === 0 && (
 <div className="py-20 flex flex-col items-center justify-center text-foreground/60 opacity-20">
 <span className="material-symbols-outlined text-8xl mb-4">menu_book</span>
 <p className="text-[10px] uppercase tracking-[0.5em] font-black">
 {searchTerm ? 'No se encontraron resultados' : 'Flujo de Datos Vacío'}
 </p>
 </div>
 )}
 </div>
 </GlassPanel>
 </section>
 </div>
 ) : centerView === 'translator' ? (
 <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
 <section className="space-y-8">
 <div className="flex items-center gap-4 px-4">
 <span className="material-symbols-outlined text-primary text-4xl">sync_alt</span>
 <h3 className="text-3xl font-black text-foreground tracking-tight italic">{t('linguistics.translator')}</h3>
 </div>

 <GlassPanel className="p-12 border-primary/20 bg-primary/5 rounded-[3rem] shadow-2xl shadow-primary/5">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
 <div className="space-y-6">
 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Entrada de Origen</label>
 <textarea
 value={sourceText}
 onChange={(e) => handleTranslate(e.target.value)}
 placeholder={t('linguistics.source_text')}
 className="w-full h-48 monolithic-panel rounded-[2.5rem] p-8 text-lg font-bold text-foreground focus:border-primary/50 outline-none transition-all placeholder-slate-800 resize-none"
 />
 </div>
 <div className="space-y-6">
 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Salida Visual</label>
 <div className="h-48 rounded-[2.5rem] monolithic-panel flex items-center justify-center relative overflow-hidden group shadow-inner">
 <span className="text-7xl font-serif text-foreground opacity-40 group-hover:opacity-100 transition-all duration-1000 whitespace-pre drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
 {renderOutput || 'α β δ γ'}
 </span>
 </div>
 </div>
 </div>
 </GlassPanel>
 </section>
 </div>
 ) : (
 /* Diccionario Léxico View */
 <section className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col gap-12">
 <div className="flex justify-between items-center px-4">
 <div className="flex flex-col">
 {/* Title removed on user request */}
 </div>
 <div className="px-6 py-2 rounded monolithic-panel border border-foreground/10 text-[10px] font-bold text-foreground/80 uppercase tracking-widest font-sans">Compilador Preparado</div>
 </div>

 <div className="space-y-12">
 {/* Mapped Glyphs Grid (Real) */}
 <section className="space-y-6">
 <div className="flex items-center justify-between px-2">
 <div className="flex items-center gap-4">
 <div className="size-2 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
 <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/80 font-sans">Inventario de Símbolos</h3>
 </div>
 <div className="flex flex-col gap-3 items-end">
 <span className="text-[10px] font-bold text-primary/40">{foundryGlyphs.length} Símbolos Indexados</span>
 <div className="flex items-center gap-4 px-6 py-2.5 rounded-none bg-background/40 border border-primary/10 ">
 <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/60 font-sans">Estado General</span>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-foreground tracking-widest font-sans">ACTIVO</span>
 <div className="size-1.5 bg-primary rounded-full shadow-lg shadow-primary/20 animate-pulse"></div>
 </div>
 </div>
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
 onClick={() => handleOpenEditor(g)}
 />
 ))}
 {/* Action Buttons: Manual Create & Import */}
 <button
 onClick={handleCreateNewGlyph}
 className="aspect-square rounded-none border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-primary/20 hover:text-primary hover:border-primary/40 transition-all cursor-pointer group gap-2"
 title="Dibujar Nuevo Glifo"
 >
 <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">draw</span>
 <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Dibujar</span>
 </button>
 <button
 onClick={handleImportGlyphClick}
 className="aspect-square rounded-none border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-primary/20 hover:text-primary hover:border-primary/40 transition-all cursor-pointer group gap-2"
 title="Importar desde SVG"
 >
 <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">upload_file</span>
 <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Importar</span>
 </button>
 </div>
 </section>

 {/* Scan Progress Bar (Functional) */}
 <div className="px-10">
 <div className="w-full h-[2px] bg-foreground/5 overflow-hidden rounded-full">
 <div
 className="h-full bg-primary shadow-lg shadow-primary/20 transition-all duration-1000"
 style={{ width: `${Math.min(100, (foundryGlyphs.length / 26) * 100)}%` }}
 ></div>
 </div>
 </div>

 {/* NEW: Word Composer Section */}
 <section className="space-y-6">
 <div className="flex items-center gap-4 px-2">
 <div className="size-2 bg-primary rounded-full shadow-[0_0_10px_#7c3aed] opacity-60"></div>
 <h3 className="text-xs font-black uppercase tracking-[0.5em] text-primary/60">Compositor de Palabras</h3>
 </div>

 <GlassPanel className="p-10 border-foreground/10 bg-background/40 rounded-[2.5rem] space-y-8">
 <div className="flex gap-8 items-start">
 <div className="flex-1 space-y-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Escritura Fonética</label>
 <input
 type="text"
 value={composerText}
 onChange={(e) => handleComposerChange(e.target.value)}
 onBlur={() => { if (composerText) handleSaveComposedWord(); }}
 onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComposedWord(); }}
 placeholder="Escribe para componer..."
 className="w-full monolithic-panel rounded-none py-6 px-8 text-2xl font-bold text-foreground outline-none focus:border-primary/40 transition-all placeholder:text-foreground/60"
 />
 </div>
 <div className="mt-10 px-6 py-4 rounded-none monolithic-panel flex items-center gap-3">
 <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/60 font-sans">Auto-Indexación</span>
 </div>
 </div>
 <div className="space-y-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Flujo de Renderizado Visual</label>
 <div className="min-h-32 p-8 rounded-none monolithic-panel flex flex-wrap gap-4 items-center justify-center relative group">
 {composerGlyphs.length > 0 ? (
 composerGlyphs.map((cg, i) => (
 <div key={i} className="flex flex-col items-center gap-1">
 <span className={`text-5xl font-serif ${cg.placeholder ? 'text-foreground/60 animate-pulse' : 'text-primary drop-shadow-md'}`}>
 {cg.lema}
 </span>
 <span className="text-[8px] font-black text-foreground/60 uppercase tracking-widest">{cg.lema}</span>
 </div>
 ))
 ) : (
 <span className="text-foreground/60 font-black uppercase tracking-[0.5em] text-[10px]">Sin glifos detectados</span>
 )}
 </div>
 </div>
 </GlassPanel>
 </section>

 <section className="space-y-6">
 <div className="flex items-center gap-4">
 <div className="size-2 bg-primary rounded-full shadow-lg shadow-primary/20 opacity-40"></div>
 <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/80 font-sans">Pizarra de Escritura Libre</h3>
 </div>
 <div className="h-64 rounded-[2.5rem] border border-primary/10 bg-background/40 flex flex-col p-12 items-center justify-center relative group shadow-inner">
 <div className="absolute top-6 left-8 text-[8px] opacity-20 uppercase tracking-widest font-bold font-sans">Disposición del Lienzo: Operativa</div>
 <textarea
 className="w-full bg-transparent border-none outline-none text-center text-7xl font-bold tracking-widest text-primary/10 group-hover:text-primary/40 transition-all placeholder:text-primary/5 resize-none italic font-serif"
 placeholder="..."
 />
 <div className="absolute bottom-6 right-8 flex gap-6 text-[8px] font-black uppercase tracking-widest text-primary/20">
 <span>Motor_V4</span>
 <span>ASCII/UTF-8</span>
 </div>
 </div>
 </section>
 </div>
 </section>
 )}
 </main>

 {portalTarget && createPortal(
 <div className="h-full flex flex-col bg-background relative overflow-hidden" >
 {editorMode ? (
 <UniversalCanvasProperties
    tool={tool}
    setTool={setTool}
    strokeWidth={strokeWidth}
    setStrokeWidth={setStrokeWidth}
    color={color}
    setColor={setColor}
    opacity={opacity}
    setOpacity={setOpacity}
    lineCap={lineCap}
    setLineCap={setLineCap}
    strokeStyle={strokeStyle}
    setStrokeStyle={setStrokeStyle}
    layers={layers}
    activeLayerId={activeLayerId}
    setActiveLayerId={setActiveLayerId}
    onToggleLayerVisibility={(id: string | number) => setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))}
    onToggleLayerLock={(id: string | number) => setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))}
    onAddLayer={() => {
      const newId = crypto.randomUUID();
      setLayers(prev => [{ id: newId, name: `Capa ${prev.length + 1}`, visible: true, locked: false, shapes: [] }, ...prev]);
      setActiveLayerId(newId);
    }}
    onDeleteLayer={(id: string | number) => {
      if (layers.length === 1) return;
      setLayers(prev => {
        const filtered = prev.filter(l => l.id !== id);
        if (activeLayerId === id) setActiveLayerId(filtered[0].id);
        return filtered;
      });
    }}
    activeShape={(selectedShapeId && !Array.isArray(selectedShapeId) ? layers.flatMap(l => l.shapes).find(s => s.id === selectedShapeId) : null) as any}
    onUndo={undo}
    onRedo={redo}
    onClear={() => {
      setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, shapes: [] } : l));
      addLog('Capa limpiada', 'info');
    }}
    onSetProperty={(prop: string, val: unknown) => {
      console.log(`Setting property ${prop} to ${val}`);
    }}
  />
 ) : (
 <LinguisticsSidebar
 stats={stats}
 langName={langName}
 glyphs={foundryGlyphs}
 rules={rules}
 onEditGlyph={handleOpenEditor}
 onCreateGlyph={handleCreateNewGlyph}
 onCreateRule={handleAddRule}
 onViewAllGlyphs={() => setCenterView('lexicon')}
 />
 )}
 </div>,
 portalTarget
 )}

 {/* Modals */}
 <ConfirmModal
 isOpen={isDeleteModalOpen}
 onClose={() => setIsDeleteModalOpen(false)}
 onConfirm={confirmDeleteWord}
 title="Eliminar Palabra"
 message="¿Estás seguro de que quieres eliminar esta palabra? Esta acción no se puede deshacer."
 confirmText="Eliminar"
 cancelText="Cancelar"
 />

 {
 isMeaningModalOpen && (
 <MeaningEditorModal
 word={editingWord}
 onClose={() => setIsMeaningModalOpen(false)}
 onSave={handleSaveMeaning}
 onEditSymbol={(word) => {
 setIsMeaningModalOpen(false);
 handleOpenEditor(word);
 }}
 />
 )
 }
 </div >
 );
};

const LexiconItem: React.FC<{
 word: string;
 type: string;
 gender?: string;
 def: string;
 onEdit?: () => void;
 onDelete?: () => void;
}> = ({ word, type, gender, def, onEdit, onDelete }) => (
 <div className="p-4 rounded-none border border-transparent hover:bg-foreground/5 hover:border-foreground/10 transition-all group cursor-pointer relative">
 <div className="flex items-center gap-3 mb-1">
 <h4 className="text-xl font-manrope font-black text-foreground group-hover:text-primary transition-colors">{word}</h4>
 <div className="flex gap-2">
 <span className="text-[9px] font-bold text-foreground/60 italic">{type}</span>
 {gender && <span className="text-[9px] font-bold text-foreground/60 uppercase">({gender})</span>}
 </div>
 </div>
 <p className="text-sm text-foreground/60 leading-relaxed font-manrope line-clamp-2 pr-16">{def}</p>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
 <button
 onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
 className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-foreground/5 hover:bg-foreground/10 rounded-none text-primary hover:text-foreground"
 title="Editar Significado"
 >
 <span className="material-symbols-outlined text-lg">edit</span>
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
 className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-foreground/5 hover:bg-red-400/20 rounded-none text-foreground/60 hover:text-red-400"
 title="Eliminar Palabra"
 >
 <span className="material-symbols-outlined text-lg">delete</span>
 </button>
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
 <div
 onClick={onClick}
 className={`aspect-square rounded-none border transition-all cursor-pointer flex items-center justify-center relative group overflow-hidden ${active ? 'bg-primary/20 border-primary shadow-xl shadow-primary/20' : 'bg-background/40 border-primary/10 hover:border-primary/40'}`}
 >
 {svgPath ? (
 <svg viewBox="0 0 1200 800" className="w-[80%] h-[80%] opacity-80 group-hover:opacity-100 transition-opacity">
 <path
 d={svgPath}
 fill="none"
 stroke={active ? "#00E5FF" : "white"}
 strokeWidth="15"
 strokeLinecap="round"
 strokeLinejoin="round"
 className="group-hover:stroke-primary transition-colors"
 />
 </svg>
 ) : (
 <span className={`text-4xl font-serif ${active || symbol ? 'text-primary' : 'opacity-20 group-hover:opacity-60 text-foreground'}`}>{symbol || '?'}</span>
 )}

 {keyLabel && (
 <span className={`absolute top-2 right-3 text-[8px] font-black uppercase ${active ? 'text-primary/80' : 'opacity-20'}`}>{keyLabel}</span>
 )}
 </div>
);

const Toggle: React.FC<{
 label: string;
 active: boolean;
 onToggle: () => void;
}> = ({ label, active, onToggle }) => (
 <div className="flex justify-between items-center px-1">
 <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{label}</span>
 <button
 onClick={onToggle}
 className={`w-10 h-5 rounded-full p-1 transition-colors relative ${active ? 'bg-primary/40' : 'bg-foreground/5'}`}
 >
 <div className={`size-3 rounded-full bg-primary shadow-lg shadow-primary/20 transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
 </button>
 </div>
);

const RuleCard: React.FC<{
 title: string;
 status?: string;
 statusColor?: string;
 desc: string;
 tags: string[];
}> = ({ title, statusColor, desc, tags }) => (
 <GlassPanel className="p-8 border-foreground/10 hover:border-foreground/40 transition-all cursor-pointer group space-y-4">
 <header className="flex justify-center gap-12 text-center items-start">
 <div className="flex items-center gap-3">
 <div className={`size-2 rounded-full bg-${statusColor}-500 shadow-[0_0_10px_rgba(var(--${statusColor}-rgb),0.5)]`}></div>
 <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{title}</h4>
 </div>
 <button className="text-foreground/60 hover:text-foreground transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
 </header>
 <p className="text-[11px] text-foreground/60 leading-relaxed font-manrope">{desc}</p>
 <div className="flex flex-wrap gap-2">
 {tags.map(tag => (
 <span key={tag} className="px-2 py-0.5 rounded monolithic-panel text-[8px] font-black uppercase tracking-widest text-foreground/60">{tag}</span>
 ))}
 </div>
 </GlassPanel>
);

// --- SUB-COMPONENTS ---

const MeaningEditorModal: React.FC<{
  word: Word | null;
  onClose: () => void;
  onSave: (data: Word & { isNew?: boolean }) => void;
  onEditSymbol: (word: Word) => void;
}> = ({ word, onClose, onSave, onEditSymbol }) => {
 const [data, setData] = useState({
 lema: word?.lema || '',
 definicion: word?.definicion || word?.traduccionEspanol || '',
 categoriaGramatical: word?.categoriaGramatical || 'Noun',
 notas: word?.notas || '',
 isNew: word?.isNew
 });

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 animate-in fade-in duration-300">
 <div className="w-full max-w-lg monolithic-panel rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
 <div className="p-8 border-b border-foreground/10 bg-white/[0.02] flex justify-between items-center">
 <div className="flex flex-col">
 <h2 className="text-xl font-black text-foreground italic tracking-tight">Editar Significado</h2>
 <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">Atributos del Lema</p>
 </div>
 <button onClick={onClose} className="size-10 rounded-none bg-foreground/5 flex items-center justify-center text-foreground/60 hover:text-foreground transition-all">
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>

 <div className="p-8 space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-4">Palabra / Lema</label>
 <input
 type="text"
 value={data.lema}
 onChange={e => setData(prev => ({ ...prev, lema: e.target.value }))}
 className="w-full monolithic-panel rounded-none py-4 px-6 text-foreground text-sm font-bold focus:border-primary/40 outline-none transition-all"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-4">Categoría</label>
 <select
 value={data.categoriaGramatical}
 onChange={e => setData(prev => ({ ...prev, categoriaGramatical: e.target.value }))}
 className="w-full monolithic-panel rounded-none py-4 px-6 text-foreground text-xs font-bold focus:border-primary/40 outline-none transition-all appearance-none"
 >
 <option value="Noun" className="bg-background text-foreground">Sustantivo</option>
 <option value="Verb" className="bg-background text-foreground">Verbo</option>
 <option value="Adj" className="bg-background text-foreground">Adjetivo</option>
 <option value="Adv" className="bg-background text-foreground">Adverbio</option>
 <option value="Conj" className="bg-background text-foreground">Conjunción</option>
 <option value="GLYPH" className="bg-background text-foreground">Glifo / Símbolo</option>
 <option value="GLYFO" className="bg-background text-foreground">Glifo / Símbolo (Alt)</option>
 <option value="GLIFO" className="bg-background text-foreground">Glifo / Símbolo (ES)</option>
 </select>
 </div>
 <div className="flex items-end pb-1">
 <button
 onClick={() => word && onEditSymbol(word)}
 className="w-full h-[52px] rounded-none border border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
 >
 <span className="material-symbols-outlined text-sm">draw</span>
 Editar Símbolo
 </button>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-4">Definición / Significado</label>
 <textarea
 value={data.definicion}
 onChange={e => setData(prev => ({ ...prev, definicion: e.target.value }))}
 className="w-full monolithic-panel rounded-none py-4 px-6 text-foreground text-sm font-bold focus:border-primary/40 outline-none transition-all h-24 resize-none"
 />
 </div>
 </div>

 <div className="p-8 bg-white/[0.02] border-t border-foreground/10 flex gap-4">
 <button
 onClick={onClose}
 className="flex-1 py-4 rounded-none text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all"
 >
 Cancelar
 </button>
 <button
 onClick={() => {
    if (word) {
      onSave({ ...word, ...data });
    } else {
      // Handle new word case if necessary, or ensure word is never null when saving
      console.error("No word to save");
    }
  }}
 className="flex-1 py-4 rounded-none bg-primary text-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105"
 >
 Guardar Cambios
 </button>
 </div>
 </div>
 </div>
 );
};

export default LinguisticsHub;
