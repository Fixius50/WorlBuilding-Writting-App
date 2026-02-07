import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
// import GlobalNotes from '../../components/layout/GlobalNotes'; // REMOVED unused
import api from '../../../js/services/api';
import * as opentype from 'opentype.js';
import UniversalCanvas from '../../components/common/editor/UniversalCanvas';
import UniversalCanvasProperties from '../../components/common/editor/UniversalCanvasProperties';
import ConfirmModal from '../../components/common/ConfirmModal';
import LinguisticsSidebar from '../../components/linguistics/LinguisticsSidebar'; // ADDED

const LinguisticsHub = ({ onOpenEditor }) => {
    const { t } = useLanguage();
    const { projectName: projectParam } = useParams();
    const { setRightPanelTab, setRightOpen } = useOutletContext(); // CHANGED
    const [projectName, setProjectName] = useState('...');
    const [stats, setStats] = useState({ words: 0, rules: 0, glyphs: 0 });
    const [langName, setLangName] = useState('...');
    const [lexicon, setLexicon] = useState([]);

    // ... (Keep existing states) ...
    const [rules, setRules] = useState([]);
    const [activeLangId, setActiveLangId] = useState(null);
    const [sourceText, setSourceText] = useState('');
    const [renderOutput, setRenderOutput] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // New UI States
    // Unified Navigation State
    const [centerView, setCenterView] = useState('lexicon'); // 'lexicon', 'translator', 'diccionario'
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarTab, setSidebarTab] = useState('MANAGEMENT'); // 'NOTES', 'MANAGEMENT'
    const [isMeaningModalOpen, setIsMeaningModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [wordToDelete, setWordToDelete] = useState(null);

    // Portal Target
    const [portalTarget, setPortalTarget] = useState(null);

    // Foundry State
    const [fontName, setFontName] = useState('CHRONOS_ATLAS_V1');
    const [fontAuthor, setFontAuthor] = useState('ARCHITECT_ID');
    const [fontFormat, setFontFormat] = useState('TTF');
    const [fontLigatures, setFontLigatures] = useState(true);
    const [fontKerning, setFontKerning] = useState(true);
    const [logs, setLogs] = useState([
        { msg: 'Inicializando Búfer de Glifos...', type: 'info' },
        { msg: 'Sincronización de Diccionario Activa', type: 'success' }
    ]);

    // Writing System Rules (Investigated)
    const WRITING_SYSTEM_TYPES = {
        ALPHABET: {
            id: 'ALPHABET',
            name: 'Alfabeto',
            desc: 'Un símbolo por fonema (consonantes y vocales coordinadas).'
        },
        ABJAD: {
            id: 'ABJAD',
            name: 'Abjad',
            desc: 'Consonantes marcadas; las vocales son diacríticos o se infieren (ej: Árabe, Hebreo).'
        },
        SYLLABARY: {
            id: 'SYLLABARY',
            name: 'Silabario',
            desc: 'Cada símbolo representa una sílaba completa (Consonante + Vocal).'
        },
        ABUGIDA: {
            id: 'ABUGIDA',
            name: 'Abugida',
            desc: 'Símbolos base para consonantes; las vocales modifican al símbolo base.'
        }
    };

    const [writingSystem, setWritingSystem] = useState(WRITING_SYSTEM_TYPES.ALPHABET.id);
    const [composerText, setComposerText] = useState('');
    const [composerGlyphs, setComposerGlyphs] = useState([]);
    const [foundryGlyphs, setFoundryGlyphs] = useState([]);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev.slice(-4), { msg, type }]);
    };

    const handleCommitData = () => {
        addLog('Sincronizando paquete de glifos...', 'info');
        setTimeout(() => addLog('Datos sincronizados con éxito [v2.2]', 'success'), 800);
    };

    // --- GLYPH EDITOR STATE ---
    const [editorMode, setEditorMode] = useState(false); // true if editing a glyph
    const [activeGlyphId, setActiveGlyphId] = useState(null);
    const [layers, setLayers] = useState([
        { id: 'layer1', name: 'Trazo Principal', visible: true, locked: false, shapes: [] },
        { id: 'layer2', name: 'Guías', visible: true, locked: false, shapes: [] }
    ]);
    const [activeLayerId, setActiveLayerId] = useState('layer1');
    const [selectedShapeId, setSelectedShapeId] = useState(null);

    // History (Undo/Redo)
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    const pushToHistory = (newLayers) => {
        // Fix: Deep copy to prevent reference mutation in history
        const snapshot = JSON.parse(JSON.stringify(newLayers));
        setPast(prev => [...prev.slice(-19), snapshot]); // Keep last 20
        setFuture([]);
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(prev => prev.slice(0, -1));
        setFuture(prev => [layers, ...prev]);
        setLayers(previous);
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture(prev => prev.slice(1));
        setPast(prev => [...prev, layers]);
        setLayers(next);
    };

    const [tool, setTool] = useState('brush'); // select, brush, eraser, line, rect, circle
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [color, setColor] = useState('#00E5FF');
    const [opacity, setOpacity] = useState(1);
    const [lineCap, setLineCap] = useState('round');
    const [strokeStyle, setStrokeStyle] = useState('linear'); // linear, points, quadratic

    // Canvas Ref
    const stageRef = React.useRef(null);

    useEffect(() => {
        loadData();
        setRightOpen(true);
        if (setRightPanelTab) setRightPanelTab('CONTEXT'); // Updated Mode
        setIsMounted(true);

        // Find Portal
        const interval = setInterval(() => {
            const el = document.getElementById('global-right-panel-portal');
            if (el) {
                setPortalTarget(el);
                clearInterval(interval);
            }
        }, 100);

        return () => {
            clearInterval(interval);
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
                            lineCap: lineCap
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
    const handleOpenEditor = (glyph) => {
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
                stroke: '#00E5FF',
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
        const computeBBox = (shape) => {
            const sx = shape.x || 0;
            const sy = shape.y || 0;
            if (shape.type === 'line' && shape.points) {
                for (let i = 0; i < shape.points.length; i += 2) {
                    const x = shape.points[i] + sx;
                    const y = shape.points[i + 1] + sy;
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
            const word = lexicon.find(w => w.id === activeGlyphId) || {
                lema: 'Nuevo Glifo',
                categoriaGramatical: 'GLYPH',
                definicion: 'Glifo dibujado manualmente'
            };

            const isPersisted = lexicon.some(w => w.id === activeGlyphId);

            if (isPersisted) {
                await api.put(`/conlang/${activeLangId}/palabra/${activeGlyphId}`, {
                    ...word,
                    svgPathData: svgPath,
                    rawEditorData: JSON.stringify(centeredLayers)
                });
            } else {
                await api.post(`/conlang/${activeLangId}/palabra`, {
                    ...word,
                    id: activeGlyphId, // Keep generated ID
                    svgPathData: svgPath,
                    rawEditorData: JSON.stringify(centeredLayers)
                });
            }

            loadLexicon(activeLangId);
            addLog('Glifo guardado y centrado con éxito', 'success');
        } catch (err) {
            console.error("Error saving glyph:", err);
            addLog('Error al guardar glifo', 'error');
            throw err; // Propagate to prevent closing if desired
        }
    };

    const handleDeleteWord = (id) => {
        setWordToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteWord = async () => {
        if (!wordToDelete || !activeLangId) return;
        try {
            await api.delete(`/conlang/${activeLangId}/palabra/${wordToDelete}`);
            loadLexicon(activeLangId);
            addLog('Palabra eliminada', 'success');
            setWordToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Error deleting word:", err);
            addLog('Error al eliminar palabra', 'error');
        }
    };

    const handleOpenMeaningEditor = (word) => {
        setEditingWord(word);
        setIsMeaningModalOpen(true);
    };

    const handleSaveMeaning = async (updatedData) => {
        if (!activeLangId) return;
        try {
            if (updatedData.isNew) {
                await api.post(`/conlang/${activeLangId}/palabra`, updatedData);
            } else {
                await api.put(`/conlang/${activeLangId}/palabra/${editingWord.id}`, updatedData);
            }
            loadLexicon(activeLangId);
            addLog('Cambios sincronizados', 'success');
            setIsMeaningModalOpen(false);
            setEditingWord(null);
        } catch (err) {
            console.error("Error saving meaning:", err);
            addLog('Error al sincronizar cambios', 'error');
        }
    };

    // Filter Lexicon based on searchTerm
    const filteredLexicon = lexicon.filter(item => {
        const search = searchTerm.toLowerCase();
        const lema = (item.lema || '').toLowerCase();
        const def = (item.traduccionEspanol || item.definicion || '').toLowerCase();
        return lema.includes(search) || def.includes(search);
    });
    const handleDrawEnd = (phase, data) => {
        // Handle drawing logic updates to layers state
        if (phase === 'START') {
            // LAYER LOCK CHECK:
            const activeLayer = layers.find(l => l.id === activeLayerId);
            if (!activeLayer || activeLayer.locked || !activeLayer.visible) {
                addLog('Capa bloqueada u oculta', 'warning');
                return;
            }

            // Create new shape in active layer
            const newShape = {
                id: crypto.randomUUID(),
                type: tool,
                stroke: color,
                strokeWidth: strokeWidth,
                opacity: opacity,
                lineCap: lineCap,
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
            setLayers(prev => prev.map(l => {
                if (l.id === activeLayerId) {
                    const shapes = [...l.shapes];
                    const lastShape = { ...shapes[shapes.length - 1] };
                    if (!lastShape) return l;

                    if (tool === 'brush' || tool === 'eraser') {
                        lastShape.points = [...lastShape.points, data.pos.x, data.pos.y];
                    } else if (tool === 'line') {
                        lastShape.points = [lastShape.points[0], lastShape.points[1], data.pos.x, data.pos.y];
                    } else if (tool === 'rect') {
                        lastShape.width = data.pos.x - lastShape.x;
                        lastShape.height = data.pos.y - lastShape.y;
                    } else if (tool === 'circle') {
                        const dx = data.pos.x - lastShape.x;
                        const dy = data.pos.y - lastShape.y;
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

    const handleChangeShape = (id, newAttrs) => {
        setLayers(prev => prev.map(l => ({
            ...l,
            shapes: l.shapes.map(s => s.id === id ? { ...s, ...newAttrs } : s)
        })));
    };

    const loadData = async () => {
        try {
            const proj = await api.get('/bd/proyecto-activo');
            setProjectName(proj.nombreProyecto);

            const conlangStats = await api.get('/conlang/stats');
            setStats(conlangStats);

            const langs = await api.get('/conlang/lenguas');
            if (langs && langs.length > 0) {
                setLangName(langs[0].nombre);
                setActiveLangId(langs[0].id);
                loadRules(langs[0].id);
                loadLexicon(langs[0].id);
            }
        } catch (err) {
            console.error("Error loading conlang data:", err);
            setProjectName("Default Project");
        }
    };

    const loadRules = async (langId) => {
        try {
            const data = await api.get(`/conlang/${langId}/rules`);
            setRules(data);
        } catch (err) {
            console.error("Error loading rules:", err);
        }
    };

    const loadLexicon = async (langId) => {
        try {
            const data = await api.get(`/conlang/${langId}/diccionario`);
            setLexicon(data);
            // Filter glyphs: accept 'GLYPH', 'GLYFO' (Spanish), or valid SVG data
            setFoundryGlyphs(data.filter(item =>
                ['GLYPH', 'GLYFO', 'GLIFO'].includes(item.categoriaGramatical) ||
                (item.svgPathData && item.lema.length === 1)
            ));
        } catch (err) {
            console.error("Error loading lexicon:", err);
        }
    };

    // Unified word creation handler
    const handleCreateNewWord = async () => {
        if (!activeLangId) return;
        setEditingWord({
            id: 'temp-' + Date.now(),
            lema: '',
            definicion: '',
            categoriaGramatical: 'Noun',
            isNew: true
        });
        setIsMeaningModalOpen(true);
    };

    const handleNewWord = async () => {
        if (!activeLangId) return;
        const lema = prompt("Enter word (Lema):");
        if (!lema) return;
        const ipa = prompt("Enter IPA (optional):");
        const def = prompt("Enter definition:");
        const cat = prompt("Enter category (Noun, Verb, etc.):");

        try {
            await api.post(`/conlang/${activeLangId}/palabra`, {
                lema: lema,
                ipa: ipa,
                definicion: def,
                categoriaGramatical: cat
            });
            loadLexicon(activeLangId);
            const conlangStats = await api.get('/conlang/stats');
            setStats(conlangStats);
        } catch (err) {
            console.error("Error adding word:", err);
        }
    };

    const handleAddRule = async () => {
        if (!activeLangId) return;
        const titulo = prompt("Enter rule title:");
        if (!titulo) return;
        const desc = prompt("Enter rule description:");
        const cat = prompt("Enter category (Grammar, Syntax, etc.):");

        try {
            await api.post(`/conlang/${activeLangId}/rules`, {
                titulo: titulo,
                descripcion: desc,
                categoria: cat,
                status: 'IN_PROGRESS'
            });
            loadRules(activeLangId);
            const conlangStats = await api.get('/conlang/stats');
            setStats(conlangStats);
        } catch (err) {
            console.error("Error adding rule:", err);
        }
    };

    const handleTranslate = (text) => {
        setSourceText(text);

        // Dynamic translator: find glyphs in foundryGlyphs
        const mapped = text.split('').map(char => {
            const match = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
            return match ? match.lema : char; // We'll render SVG later in output if possible, or just the symbol
        }).join(' ');

        setRenderOutput(mapped);
    };

    const handleComposerChange = (text) => {
        setComposerText(text);
        const sequence = text.split('').map(char => {
            const glyph = foundryGlyphs.find(g => g.lema.toLowerCase() === char.toLowerCase());
            return glyph || { lema: char, placeholder: true };
        });
        setComposerGlyphs(sequence);
    };

    const handleSaveComposedWord = async () => {
        if (!activeLangId || !composerText) return;

        try {
            await api.post(`/conlang/${activeLangId}/palabra`, {
                lema: composerText,
                definicion: `Entrada automática (${new Date().toLocaleDateString()})`,
                categoriaGramatical: 'COMPUESTA'
            });
            loadLexicon(activeLangId);
            addLog(`Palabra "${composerText}" sincronizada automáticamente`, 'success');
        } catch (err) {
            console.error("Error al guardar automáticamente:", err);
        }
    };

    const getNextUnicodeCode = () => {
        const codes = foundryGlyphs
            .map(g => g.unicodeCode)
            .filter(c => c && c.startsWith('U+'))
            .map(c => parseInt(c.replace('U+', ''), 16));

        const nextVal = codes.length > 0 ? Math.max(...codes) + 1 : 0xE000;
        return `U+${nextVal.toString(16).toUpperCase()}`;
    };



    const fileInputRef = useRef(null);

    const handleImportGlyphClick = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const match = text.match(/d="([^"]+)"/);

            if (match && match[1]) {
                const svgPath = match[1];
                const nextCode = getNextUnicodeCode();
                const char = String.fromCharCode(parseInt(nextCode.replace('U+', ''), 16));

                try {
                    await api.post(`/conlang/${activeLangId}/palabra`, {
                        lema: char,
                        categoriaGramatical: 'GLYFO',
                        definicion: `Glifo importado (${file.name})`,
                        svgPathData: svgPath,
                        unicodeCode: nextCode
                    });
                    loadLexicon(activeLangId);
                    addLog(`Glifo ${nextCode} importado con éxito`, 'success');
                } catch (err) {
                    addLog('Error al importar glifo', 'error');
                }
            } else {
                alert("SVG inválido para renderizado de glifos.");
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const handleExportFont = async () => {
        if (!activeLangId || foundryGlyphs.length === 0) {
            alert("No hay glifos mapeados para exportar.");
            return;
        }

        addLog("Compilando fuente tipográfica...", "info");

        try {
            if (!opentype) throw new Error("Motor de fuentes (opentype.js) no cargado.");

            const font = new opentype.Font({
                familyName: fontName || 'Atlas_Conlang',
                styleName: 'Regular',
                unitsPerEm: 1024,
                ascender: 800,
                descender: -200
            });

            const notdefGlyph = new opentype.Glyph({
                name: '.notdef',
                unicode: 0,
                advanceWidth: 650,
                path: new opentype.Path()
            });
            font.glyphs.push(notdefGlyph);

            foundryGlyphs.forEach(g => {
                if (!g.svgPathData || !g.unicodeCode) return;
                const unicode = parseInt(g.unicodeCode.replace('U+', ''), 16);
                const path = new opentype.Path();
                const commands = g.svgPathData.match(/[a-df-z][^a-df-z]*/gi);
                if (commands) {
                    commands.forEach(cmdStr => {
                        const type = cmdStr[0].toUpperCase();
                        const args = cmdStr.slice(1).trim().split(/[\s,]+/).map(parseFloat);
                        if (type === 'M') path.moveTo(args[0], args[1]);
                        else if (type === 'L') path.lineTo(args[0], args[1]);
                        else if (type === 'C') path.curveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
                        else if (type === 'Q') path.quadraticCurveTo(args[0], args[1], args[2], args[3]);
                        else if (type === 'Z') path.close();
                    });
                }

                const glyph = new opentype.Glyph({
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

            const formData = new FormData();
            formData.append('file', blob, 'font.ttf');
            await api.post(`/conlang/${activeLangId}/upload-font`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addLog("Fuente sincronizada con el servidor [v1.0]", "success");
            alert("¡Fuente generada y guardada en el servidor con éxito!");
        } catch (err) {
            console.error("Error exportando fuente:", err);
            addLog("Error en compilación de fuente", "error");
            alert("Error al generar la fuente: " + err.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050508] text-slate-300 font-sans overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".svg"
                className="hidden"
            />

            {/* Minimal Navigation Bar */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40">
                <div className="flex items-center gap-4">
                    {/* Header Info Hidden on User Request */}
                </div>

                {/* Unified Navigation Switcher - Centered absolutely */}
                {!editorMode && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                        {[
                            { id: 'lexicon', label: t('linguistics.lexicon') },
                            { id: 'translator', label: t('linguistics.translator') },
                            { id: 'diccionario', label: 'DICCIONARIO' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCenterView(tab.id)}
                                className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${centerView === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Editor Actions - Replace Switcher when editing */}
                {editorMode && (
                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={handleCloseEditor}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Descartar
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                            onClick={async () => {
                                await handleSaveCurrentGlyph();
                                handleCloseEditor();
                            }}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg hover:shadow-primary/20 transition-all"
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
                                    <h3 className="text-3xl font-black text-white tracking-tight italic">{t('linguistics.lexicon')}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.words} Palabras Mapeadas</p>
                                </div>
                                <Button variant="primary" size="md" onClick={handleCreateNewGlyph} icon="draw">Nuevo Glifo</Button>
                            </div>

                            <GlassPanel className="p-0 border-white/5 bg-surface-dark/40 overflow-hidden shadow-2xl rounded-[2.5rem]">
                                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-black/20">
                                    <div className="flex-1 relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg">search</span>
                                        <input
                                            type="text"
                                            placeholder={t('linguistics.search_lexicon')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                    <button className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10"><span className="material-symbols-outlined text-xl">tune</span></button>
                                </div>

                                <div className="p-8 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar custom-scrollbar">
                                    {filteredLexicon.map(item => (
                                        <LexiconItem
                                            key={item.id}
                                            word={item.lema || item.palabraOriginal}
                                            type={item.categoriaGramatical}
                                            gender={item.genero}
                                            def={item.definicion || item.traduccionEspanol}
                                            onEdit={() => handleOpenMeaningEditor(item)}
                                            onDelete={() => handleDeleteWord(item.id)}
                                        />
                                    ))}
                                    {filteredLexicon.length === 0 && (
                                        <div className="py-20 flex flex-col items-center justify-center text-slate-600 opacity-20">
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
                                <h3 className="text-3xl font-black text-white tracking-tight italic">{t('linguistics.translator')}</h3>
                            </div>

                            <GlassPanel className="p-12 border-primary/20 bg-primary/5 rounded-[3rem] shadow-2xl shadow-primary/5">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Entrada de Origen</label>
                                        <textarea
                                            value={sourceText}
                                            onChange={(e) => handleTranslate(e.target.value)}
                                            placeholder={t('linguistics.source_text')}
                                            className="w-full h-48 bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-lg font-bold text-white focus:border-primary/50 outline-none transition-all placeholder-slate-800 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Salida Visual</label>
                                        <div className="h-48 rounded-[2.5rem] bg-black/60 border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                                            <span className="text-7xl font-serif text-white opacity-40 group-hover:opacity-100 transition-all duration-1000 whitespace-pre drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
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
                            <div className="px-6 py-2 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.3em] animate-pulse">Búfer de Sincronización Listo</div>
                        </div>

                        <div className="space-y-12">
                            {/* Mapped Glyphs Grid (Real) */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="size-2 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-[#00E5FF]/60">Glifos Mapeados</h3>
                                    </div>
                                    <div className="flex flex-col gap-3 items-end">
                                        <span className="text-[10px] font-bold text-[#00E5FF]/40">{foundryGlyphs.length} Símbolos Indexados</span>
                                        <div className="flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-black/40 border border-[#00E5FF]/10 backdrop-blur-md">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00E5FF]/60 font-mono">Estado del Búfer</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-white tracking-widest">SINCRONIZADO</span>
                                                <div className="size-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF] animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 rounded-[2.5rem] border border-[#00E5FF]/10 bg-[#00E5FF]/[0.02] grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
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
                                        className="aspect-square rounded-2xl border-2 border-dashed border-[#00E5FF]/10 flex flex-col items-center justify-center text-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all cursor-pointer group gap-2"
                                        title="Dibujar Nuevo Glifo"
                                    >
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">draw</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Dibujar</span>
                                    </button>
                                    <button
                                        onClick={handleImportGlyphClick}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-[#00E5FF]/10 flex flex-col items-center justify-center text-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all cursor-pointer group gap-2"
                                        title="Importar desde SVG"
                                    >
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">upload_file</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Importar</span>
                                    </button>
                                </div>
                            </section>

                            {/* Scan Progress Bar (Functional) */}
                            <div className="px-10">
                                <div className="w-full h-[2px] bg-white/5 overflow-hidden rounded-full">
                                    <div
                                        className="h-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] transition-all duration-1000"
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

                                <GlassPanel className="p-10 border-white/5 bg-black/40 rounded-[2.5rem] space-y-8">
                                    <div className="flex gap-8 items-start">
                                        <div className="flex-1 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Escritura Fonética</label>
                                            <input
                                                type="text"
                                                value={composerText}
                                                onChange={(e) => handleComposerChange(e.target.value)}
                                                onBlur={() => { if (composerText) handleSaveComposedWord(); }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComposedWord(); }}
                                                placeholder="Escribe para componer..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-2xl font-bold text-white outline-none focus:border-primary/40 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="mt-10 px-6 py-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Auto-Sincronización</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Flujo de Renderizado Visual</label>
                                        <div className="min-h-32 p-8 rounded-2xl bg-black/60 border border-white/5 flex flex-wrap gap-4 items-center justify-center relative group">
                                            {composerGlyphs.length > 0 ? (
                                                composerGlyphs.map((cg, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-1">
                                                        <span className={`text-5xl font-serif ${cg.placeholder ? 'text-slate-800 animate-pulse' : 'text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]'}`}>
                                                            {cg.lema}
                                                        </span>
                                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{cg.lema}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-slate-800 font-black uppercase tracking-[0.5em] text-[10px]">Sin glifos detectados</span>
                                            )}
                                        </div>
                                    </div>
                                </GlassPanel>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-2 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF] opacity-40"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.5em] text-[#00E5FF]/60">Previsualización de Transmisión</h3>
                                </div>
                                <div className="h-64 rounded-[2.5rem] border border-[#00E5FF]/10 bg-black/40 flex flex-col p-12 items-center justify-center relative group shadow-inner">
                                    <div className="absolute top-6 left-8 text-[8px] opacity-20 uppercase tracking-[0.3em] font-black">Estado del Búfer: Activo</div>
                                    <textarea
                                        className="w-full bg-transparent border-none outline-none text-center text-7xl font-bold tracking-widest text-[#00E5FF]/10 group-hover:text-[#00E5FF]/40 transition-all placeholder:text-[#00E5FF]/5 resize-none italic font-serif"
                                        placeholder="..."
                                    />
                                    <div className="absolute bottom-6 right-8 flex gap-6 text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/20">
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
                            onToggleLayerVisibility={(id) => setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))}
                            onToggleLayerLock={(id) => setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))}
                            onAddLayer={() => {
                                const newId = crypto.randomUUID();
                                setLayers(prev => [{ id: newId, name: `Capa ${prev.length + 1}`, visible: true, locked: false, shapes: [] }, ...prev]);
                                setActiveLayerId(newId);
                            }}
                            onDeleteLayer={(id) => {
                                if (layers.length === 1) return;
                                setLayers(prev => {
                                    const filtered = prev.filter(l => l.id !== id);
                                    if (activeLayerId === id) setActiveLayerId(filtered[0].id);
                                    return filtered;
                                });
                            }}
                            activeShape={selectedShapeId && !Array.isArray(selectedShapeId) ? layers.flatMap(l => l.shapes).find(s => s.id === selectedShapeId) : null}
                            onUndo={undo}
                            onRedo={redo}
                            onClear={() => {
                                setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, shapes: [] } : l));
                                addLog('Capa limpiada', 'info');
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

const LexiconItem = ({ word, type, gender, def, onEdit, onDelete }) => (
    <div className="p-4 rounded-2xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all group cursor-pointer relative">
        <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-manrope font-black text-white group-hover:text-primary transition-colors">{word}</h4>
            <div className="flex gap-2">
                <span className="text-[9px] font-bold text-slate-600 italic">{type}</span>
                {gender && <span className="text-[9px] font-bold text-slate-700 uppercase">({gender})</span>}
            </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-manrope line-clamp-2 pr-16">{def}</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
            <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/5 hover:bg-white/10 rounded-xl text-primary hover:text-white"
                title="Editar Significado"
            >
                <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/5 hover:bg-red-400/20 rounded-xl text-slate-600 hover:text-red-400"
                title="Eliminar Palabra"
            >
                <span className="material-symbols-outlined text-lg">delete</span>
            </button>
        </div>
    </div>
);

const GlyphSlot = ({ symbol, svgPath, keyLabel, active, onClick }) => (
    <div
        onClick={onClick}
        className={`aspect-square rounded-2xl border transition-all cursor-pointer flex items-center justify-center relative group overflow-hidden ${active ? 'bg-[#00E5FF]/20 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-[#00E5FF]/10 hover:border-[#00E5FF]/40'}`}
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
                    className="group-hover:stroke-[#00E5FF] transition-colors"
                />
            </svg>
        ) : (
            <span className={`text-4xl font-serif ${active || symbol ? 'text-[#00E5FF]' : 'opacity-20 group-hover:opacity-60 text-white'}`}>{symbol || '?'}</span>
        )}

        {keyLabel && (
            <span className={`absolute top-2 right-3 text-[8px] font-black uppercase ${active ? 'text-[#00E5FF]/80' : 'opacity-20'}`}>{keyLabel}</span>
        )}
    </div>
);

const Toggle = ({ label, active, onToggle }) => (
    <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]/60">{label}</span>
        <button
            onClick={onToggle}
            className={`w-10 h-5 rounded-full p-1 transition-colors relative ${active ? 'bg-[#00E5FF]/40' : 'bg-white/5'}`}
        >
            <div className={`size-3 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

const RuleCard = ({ title, status, statusColor, desc, tags }) => (
    <GlassPanel className="p-8 border-white/5 hover:border-white/10 transition-all cursor-pointer group space-y-4">
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full bg-${statusColor}-500 shadow-[0_0_10px_rgba(var(--${statusColor}-rgb),0.5)]`}></div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{title}</h4>
            </div>
            <button className="text-slate-700 hover:text-white transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
        </header>
        <p className="text-[11px] text-slate-500 leading-relaxed font-manrope">{desc}</p>
        <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-600">{tag}</span>
            ))}
        </div>
    </GlassPanel>
);

// --- SUB-COMPONENTS ---

const MeaningEditorModal = ({ word, onClose, onSave, onEditSymbol }) => {
    const [data, setData] = useState({
        lema: word?.lema || '',
        definicion: word?.definicion || word?.traduccionEspanol || '',
        categoriaGramatical: word?.categoriaGramatical || 'Noun',
        notas: word?.notas || '',
        isNew: word?.isNew
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-[#0A0A0F] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white italic tracking-tight">Editar Significado</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Atributos del Lema</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Palabra / Lema</label>
                        <input
                            type="text"
                            value={data.lema}
                            onChange={e => setData(prev => ({ ...prev, lema: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-primary/40 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Categoría</label>
                            <select
                                value={data.categoriaGramatical}
                                onChange={e => setData(prev => ({ ...prev, categoriaGramatical: e.target.value }))}
                                className="w-full bg-[#1a1a20] border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold focus:border-primary/40 outline-none transition-all appearance-none"
                            >
                                <option value="Noun" className="bg-[#1a1a20] text-white">Sustantivo</option>
                                <option value="Verb" className="bg-[#1a1a20] text-white">Verbo</option>
                                <option value="Adj" className="bg-[#1a1a20] text-white">Adjetivo</option>
                                <option value="Adv" className="bg-[#1a1a20] text-white">Adverbio</option>
                                <option value="Conj" className="bg-[#1a1a20] text-white">Conjunción</option>
                                <option value="GLYPH" className="bg-[#1a1a20] text-white">Glifo / Símbolo</option>
                                <option value="GLYFO" className="bg-[#1a1a20] text-white">Glifo / Símbolo (Alt)</option>
                                <option value="GLIFO" className="bg-[#1a1a20] text-white">Glifo / Símbolo (ES)</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-1">
                            <button
                                onClick={() => onEditSymbol(word)}
                                className="w-full h-[52px] rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">draw</span>
                                Editar Símbolo
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Definición / Significado</label>
                        <textarea
                            value={data.definicion}
                            onChange={e => setData(prev => ({ ...prev, definicion: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-primary/40 outline-none transition-all h-24 resize-none"
                        />
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(data)}
                        className="flex-1 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinguisticsHub;
