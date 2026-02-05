import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import GlobalNotes from '../../components/layout/GlobalNotes';
import api from '../../../js/services/api';
import * as opentype from 'opentype.js';

const LinguisticsHub = ({ onOpenEditor }) => {
    const { t } = useLanguage();
    const { projectName: projectParam } = useParams();
    const { setRightPanelMode, setRightOpen, setRightPanelTitle } = useOutletContext();
    const [projectName, setProjectName] = useState('...');
    const [stats, setStats] = useState({ words: 0, rules: 0, glyphs: 0 });
    const [langName, setLangName] = useState('...');
    const [lexicon, setLexicon] = useState([]);
    const [rules, setRules] = useState([]);
    const [activeLangId, setActiveLangId] = useState(null);
    const [sourceText, setSourceText] = useState('');
    const [renderOutput, setRenderOutput] = useState('');

    // New UI States
    const [hubMode, setHubMode] = useState('linguistics'); // 'linguistics', 'biblia'
    const [centerView, setCenterView] = useState('lexicon'); // 'lexicon', 'translator'
    const [sidebarTab, setSidebarTab] = useState('MANAGEMENT'); // 'NOTES', 'MANAGEMENT', 'BIBLIA'

    // Foundry State
    const [fontName, setFontName] = useState('CHRONOS_ATLAS_V1');
    const [fontAuthor, setFontAuthor] = useState('ARCHITECT_ID');
    const [fontFormat, setFontFormat] = useState('TTF');
    const [fontLigatures, setFontLigatures] = useState(true);
    const [fontKerning, setFontKerning] = useState(true);
    const [logs, setLogs] = useState([
        { msg: 'Inicializando Búfer de Glifos...', type: 'info' },
        { msg: 'Sincronización de Biblia Activa', type: 'success' }
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

    useEffect(() => {
        loadData();
        setRightPanelMode('CUSTOM');
        setRightPanelTitle('Lingüística');
        setRightOpen(true);

        return () => {
            setRightPanelMode('NOTES');
            setRightPanelTitle('');
        };
    }, []);

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

    const handleCreateNewGlyph = async () => {
        let targetLangId = activeLangId;

        if (!targetLangId) {
            try {
                const langs = await api.get('/conlang/lenguas');
                if (langs && langs.length > 0) {
                    targetLangId = langs[0].id;
                    setActiveLangId(targetLangId);
                    setLangName(langs[0].nombre);
                } else {
                    // Solo enviamos el nombre, el backend asocia el proyecto vía sesión
                    const newLang = await api.post('/conlang/lengua', { nombre: "Lengua Principal" });
                    targetLangId = newLang.id;
                    setActiveLangId(targetLangId);
                }
            } catch (e) {
                console.error("Error crítico inicializando conlang:", e);
                alert("Error inicializando sistema de glifos. Revisa la consola del servidor.");
                return;
            }
        }

        const nextCode = getNextUnicodeCode();
        // Automatic assignment: Use the hex code as the 'lema' for technical mapping
        // but we'll use it mostly as a unique visual ID.
        const char = String.fromCharCode(parseInt(nextCode.replace('U+', ''), 16));

        try {
            const response = await api.post(`/conlang/${targetLangId}/palabra`, {
                lema: char,
                categoriaGramatical: 'GLYFO',
                definicion: `Glifo automático ${nextCode}`,
                unicodeCode: nextCode
            });
            loadLexicon(targetLangId);
            onOpenEditor(response);
        } catch (err) {
            console.error("Error al crear glifo:", err);
            alert("Error al crear glifo automático.");
        }
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
                const glyph = new opentype.Glyph({
                    name: `glyph_${g.unicodeCode}`,
                    unicode: unicode,
                    advanceWidth: 800,
                    path: opentype.parsePathData(g.svgPathData)
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

                {/* Center Tabs Switcher */}
                {hubMode === 'linguistics' && (
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setCenterView('lexicon')}
                            className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${centerView === 'lexicon' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {t('linguistics.lexicon')}
                        </button>
                        <button
                            onClick={() => setCenterView('translator')}
                            className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${centerView === 'translator' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {t('linguistics.translator')}
                        </button>
                    </div>
                )}

                {hubMode === 'biblia' && (
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4 animate-in slide-in-from-left duration-700">
                            <div className="p-3 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                                <span className="material-symbols-outlined text-2xl">menu_book</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Biblia Léxica</h1>
                                <p className="text-[9px] font-bold text-[#00E5FF]/50 uppercase tracking-widest flex items-center gap-2">
                                    <span className="size-1 bg-[#00E5FF] rounded-full animate-pulse"></span>
                                    Sincronización Automática Activa
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <main className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12">
                {hubMode === 'linguistics' ? (
                    <div className="max-w-6xl mx-auto w-full">
                        {centerView === 'lexicon' ? (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex justify-between items-center px-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-3xl font-black text-white tracking-tight italic">{t('linguistics.lexicon')}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.words} Palabras Mapeadas</p>
                                    </div>
                                    <Button variant="primary" size="md" onClick={handleNewWord} icon="add">Añadir Palabra</Button>
                                </div>

                                <GlassPanel className="p-0 border-white/5 bg-surface-dark/40 overflow-hidden shadow-2xl rounded-[2.5rem]">
                                    <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-black/20">
                                        <div className="flex-1 relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg">search</span>
                                            <input
                                                type="text"
                                                placeholder={t('linguistics.search_lexicon')}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder-slate-600"
                                            />
                                        </div>
                                        <button className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10"><span className="material-symbols-outlined text-xl">tune</span></button>
                                    </div>

                                    <div className="p-8 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar custom-scrollbar">
                                        {lexicon.map(item => (
                                            <LexiconItem
                                                key={item.id}
                                                word={item.lema || item.palabraOriginal}
                                                type={item.categoriaGramatical}
                                                gender={item.genero}
                                                def={item.definicion || item.traduccionEspanol}
                                                onEditSymbol={() => onOpenEditor(item)}
                                            />
                                        ))}
                                        {lexicon.length === 0 && (
                                            <div className="py-20 flex flex-col items-center justify-center text-slate-600 opacity-20">
                                                <span className="material-symbols-outlined text-8xl mb-4">menu_book</span>
                                                <p className="text-[10px] uppercase tracking-[0.5em] font-black">Flujo de Datos Vacío</p>
                                            </div>
                                        )}
                                    </div>
                                </GlassPanel>
                            </section>
                        ) : (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-4 px-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">sync_alt</span>
                                    <h3 className="text-3xl font-black text-white tracking-tight italic">{t('linguistics.translator')}</h3>
                                </div>

                                <GlassPanel className="p-12 border-primary/20 bg-primary/5 rounded-[3rem] space-y-10 shadow-2xl shadow-primary/5">
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
                                                <div className="absolute bottom-4 right-8 flex gap-4 text-[8px] font-black uppercase tracking-widest text-slate-700">
                                                    <span>Paso_Vector</span>
                                                    <span>Motor_V4</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </section>
                        )}
                    </div>
                ) : (
                    /* Biblia Léxica View */
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
                                            keyLabel={g.lema.toUpperCase()}
                                            active={false}
                                            onClick={() => onOpenEditor(g)}
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
                    </section >
                )}
            </main >

            {
                createPortal(
                    <div className="h-full flex flex-col bg-[#0d0d12] relative overflow-hidden" >
                        <div className="flex border-b border-white/5 bg-black/40 p-2">
                            {['NOTES', 'MANAGEMENT', 'BIBLIA'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setSidebarTab(tab);
                                        if (tab === 'BIBLIA') setHubMode('biblia');
                                        else setHubMode('linguistics');
                                    }}
                                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${sidebarTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar">
                            {sidebarTab === 'NOTES' && (
                                <div className="h-full">
                                    <GlobalNotes projectName={projectParam} />
                                </div>
                            )}

                            {sidebarTab === 'MANAGEMENT' && (
                                <div className="p-6 space-y-12 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <section className="space-y-6">
                                        <div className="flex justify-between items-center px-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sistemas de Escritura</h4>
                                            <span className="material-symbols-outlined text-slate-700 text-sm">history_edu</span>
                                        </div>
                                        <div className="space-y-4">
                                            {Object.values(WRITING_SYSTEM_TYPES).map(sys => (
                                                <button
                                                    key={sys.id}
                                                    onClick={() => setWritingSystem(sys.id)}
                                                    className={`w-full p-4 rounded-2xl border text-left transition-all ${writingSystem === sys.id ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${writingSystem === sys.id ? 'text-primary' : 'text-white/60'}`}>{sys.name}</span>
                                                        {writingSystem === sys.id && <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>}
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 leading-tight">{sys.desc}</p>
                                                </button>
                                            ))}

                                            {/* Profundización de Reglas */}
                                            <div className="p-4 rounded-2xl bg-black/40 border border-[#00E5FF]/10 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[#00E5FF] text-xs">info</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/60">Guía del Sistema</span>
                                                </div>
                                                <p className="text-[9px] text-slate-400 leading-relaxed italic">
                                                    {writingSystem === 'ALPHABET' && "Los sistemas alfabéticos son ideales para lenguas donde cada sonido (fonema) importa. Asegúrate de tener glifos para vocales y consonantes por separado."}
                                                    {writingSystem === 'ABJAD' && "En un Abjad, el foco está en la raíz de las palabras (consonantes). Puedes usar diacríticos para marcar vocales opcionales o simplemente no mapearlas visualmente."}
                                                    {writingSystem === 'SYLLABARY' && "Los silabarios reducen el número de caracteres necesarios para palabras largas, pero requieren una rejilla de glifos mucho más extensa (e.g., Kana japonés)."}
                                                    {writingSystem === 'ABUGIDA' && "Sistema híbrido muy común en escrituras índicas. El glifo cambia de forma o recibe marcas según la vocal que le sigue."}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('linguistics.writing_system')}</h4>
                                            <button onClick={handleCreateNewGlyph} className="text-primary hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                            </button>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                            <div className="grid grid-cols-4 gap-2">
                                                {foundryGlyphs.slice(0, 8).map(g => (
                                                    <div
                                                        key={g.id}
                                                        onClick={() => onOpenEditor(g)}
                                                        className="aspect-square rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-xl font-serif text-[#00E5FF] hover:border-primary/40 transition-all cursor-pointer"
                                                    >
                                                        <span>{g.lema}</span>
                                                    </div>
                                                ))}
                                                {foundryGlyphs.length === 0 && (
                                                    <div className="col-span-4 py-8 flex items-center justify-center opacity-20">
                                                        <span className="text-[8px] font-black uppercase font-mono">No data</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('linguistics.grammar')}</h4>
                                            <button onClick={handleAddRule} className="text-primary hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {rules.map(rule => (
                                                <div key={rule.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`size-1.5 rounded-full ${rule.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                        <span className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">{rule.titulo}</span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 leading-tight line-clamp-2">{rule.descripcion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('linguistics.phonology')}</h4>
                                        <div className="flex flex-wrap gap-1.5 opacity-60">
                                            {['/a/', '/e/', '/i/', '/o/', '/u/', '/p/', '/t/', '/k/'].map(v => (
                                                <div key={v} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-mono font-bold text-slate-400">{v}</div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {sidebarTab === 'BIBLIA' && (
                                <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2 text-[#00E5FF]">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Matriz de Configuración</h4>
                                        <p className="text-[9px] opacity-40 font-bold">Compilador de Lenguaje Visual</p>
                                    </div>

                                    <div className="space-y-6">
                                        <GlassPanel className="p-6 border-[#00E5FF]/20 bg-[#00E5FF]/[0.02] space-y-6 rounded-2xl">
                                            <div className="space-y-3">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/60 block">Nombre de Fuente</label>
                                                <input
                                                    type="text"
                                                    defaultValue="CHRONOS_ATLAS_V1"
                                                    className="w-full bg-black/60 border border-[#00E5FF]/30 px-4 py-3 text-[10px] font-black text-[#00E5FF] outline-none tracking-widest uppercase italic"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/60 block">Autor</label>
                                                <input
                                                    type="text"
                                                    placeholder="ARCHITECT_ID"
                                                    className="w-full bg-black/60 border border-[#00E5FF]/30 px-4 py-3 text-[10px] font-black text-[#00E5FF] outline-none tracking-widest uppercase italic"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/60 block">Formato</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => { setFontFormat('TTF'); addLog('Formato cambiado a TTF'); }}
                                                        className={`py-3 border text-xs font-black tracking-widest transition-all ${fontFormat === 'TTF' ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'border-[#00E5FF]/20 text-[#00E5FF]/40 hover:border-[#00E5FF]/40'}`}
                                                    >
                                                        .TTF
                                                    </button>
                                                    <button
                                                        onClick={() => { setFontFormat('OTF'); addLog('Formato cambiado a OTF'); }}
                                                        className={`py-3 border text-xs font-black tracking-widest transition-all ${fontFormat === 'OTF' ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'border-[#00E5FF]/20 text-[#00E5FF]/40 hover:border-[#00E5FF]/40'}`}
                                                    >
                                                        .OTF
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <Toggle label="Ligaduras" active={fontLigatures} onToggle={() => { setFontLigatures(!fontLigatures); addLog(`Ligaduras ${!fontLigatures ? 'Activadas' : 'Desactivadas'}`); }} />
                                                <Toggle label="Interletraje" active={fontKerning} onToggle={() => { setFontKerning(!fontKerning); addLog(`Interletraje ${!fontKerning ? 'Activado' : 'Desactivado'}`); }} />
                                            </div>

                                            <button
                                                onClick={handleExportFont}
                                                className="w-full py-4 bg-[#00E5FF] text-black font-black uppercase text-[10px] tracking-widest rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Exportar Recursos
                                            </button>
                                        </GlassPanel>

                                        <div className="p-6 rounded-2xl border border-white/5 bg-black/20 space-y-4 font-mono text-[7px]">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[#00E5FF]/40 font-sans">
                                                <span>Registro en Tiempo Real</span>
                                                <span className="size-1 bg-[#00E5FF] rounded-full animate-pulse"></span>
                                            </div>
                                            <div className="space-y-1.5 opacity-60">
                                                {logs.map((log, idx) => (
                                                    <p key={idx} className={log.type === 'success' ? 'text-emerald-400' : 'text-[#00E5FF]'}>
                                                        [{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}] {log.msg}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.getElementById('architect-right-panel-portal')
                )}
        </div >
    );
};

const LexiconItem = ({ word, type, gender, def, onEditSymbol }) => (
    <div className="p-4 rounded-2xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all group cursor-pointer relative">
        <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-manrope font-black text-white group-hover:text-primary transition-colors">{word}</h4>
            <div className="flex gap-2">
                <span className="text-[9px] font-bold text-slate-600 italic">{type}</span>
                {gender && <span className="text-[9px] font-bold text-slate-700 uppercase">({gender})</span>}
            </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-manrope">{def}</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onEditSymbol?.(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-primary hover:text-white"
                title="Edit Symbol"
            >
                <span className="material-symbols-outlined">draw</span>
            </button>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-600 hover:text-white"><span className="material-symbols-outlined">edit_note</span></button>
        </div>
    </div>
);

const GlyphSlot = ({ symbol, keyLabel, active, onClick }) => (
    <div
        onClick={onClick}
        className={`aspect-square rounded-2xl border transition-all cursor-pointer flex items-center justify-center relative group ${active ? 'bg-[#00E5FF]/20 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-[#00E5FF]/10 hover:border-[#00E5FF]/40'}`}
    >
        <span className={`text-4xl font-serif ${active || symbol ? 'text-[#00E5FF]' : 'opacity-20 group-hover:opacity-60 text-white'}`}>{symbol || '?'}</span>
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

export default LinguisticsHub;
