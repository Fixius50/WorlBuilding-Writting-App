import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Stage, Layer, Line, Image as KonvaImage, Rect, Text as KonvaText, Transformer } from 'react-konva';

import api from '../../../js/services/api';
import Button from '../../components/common/Button';
import GlassPanel from '../../components/common/GlassPanel';

// --- COMPONENTS FOR WIZARD ---

const AccordionSection = ({ stepNumber, title, isOpen, onClick, children }) => (
    <div className={`border border-white/10 rounded-2xl bg-[#13141f] overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/50' : 'opacity-80'}`}>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`size-8 rounded-full flex items-center justify-center font-black text-sm ${isOpen ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>
                    {stepNumber}
                </div>
                <h3 className={`text-lg font-bold ${isOpen ? 'text-white' : 'text-slate-400'}`}>{title}</h3>
            </div>
            <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-slate-500'}`}>expand_more</span>
        </button>

        {isOpen && (
            <div className="p-6 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                {children}
            </div>
        )}
    </div>
);

const TypeCard = ({ icon, title, desc, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-xl border cursor-pointer transition-all relative group h-full flex flex-col justify-between ${selected ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(var(--color-primary),0.3)]' : 'bg-[#0a0a0c] border-white/10 hover:border-white/30'}`}
    >
        <div className="mb-4">
            <div className={`size-12 rounded-lg flex items-center justify-center mb-4 ${selected ? 'bg-primary text-white' : 'bg-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/20'}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <h4 className="font-bold text-white mb-1">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
        {selected && (
            <div className="absolute top-4 right-4 size-3 bg-primary rounded-full shadow-glow"></div>
        )}
    </div>
);

const URLImage = ({ src, x, y, width, height }) => {
    const [image, setImage] = useState(null);
    useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            setImage(img);
        };
    }, [src]);
    return <KonvaImage image={image} x={x} y={y} width={width} height={height} />;
};

// Canvas Placeholder Removed - Using Real Stage

const TransformerComponent = ({ selectedId }) => {
    const trRef = React.useRef();
    React.useEffect(() => {
        if (selectedId) {
            // we need to attach transformer manually
            const node = trRef.current.getStage().findOne('#' + selectedId);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer().batchDraw();
            }
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedId]);
    return <Transformer ref={trRef} />;
};


const MapEditor = ({ mode: initialMode }) => {
    const { username, projectName, folderId, entityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        setRightOpen,
        setRightPanelMode,
        setAvailableTemplates,
        // Map Settings Context
        mapSettings,
        setMapSettings,
        setOnMapSettingsChange
    } = useOutletContext();

    // Editor Step State
    const [step, setStep] = useState(initialMode === 'create' ? 'setup' : 'editor');

    // Force step sync if mode changes (e.g. navigation from create -> edit)
    useEffect(() => {
        setStep(initialMode === 'create' ? 'setup' : 'editor');
    }, [initialMode]);

    // Stats
    const [realFolderId, setRealFolderId] = useState(location.state?.folderId || null);

    // Wizard Form State
    const [wizardSection, setWizardSection] = useState(1); // 1, 2, 3
    const [formData, setFormData] = useState({
        name: 'New Map',
        description: '',
        parentZone: null,
        type: 'regional', // world, regional, local
        sourceType: 'blank', // blank, upload
        dims: { width: 800, height: 600 }, // Only for blank
        bgImage: null // DataURL
    });

    const [saving, setSaving] = useState(false);

    // --- KONVA STATE ---
    const [tool, setTool] = useState('brush'); // brush, eraser
    const [lines, setLines] = useState([]);
    const [rectangles, setRectangles] = useState([]);
    const [texts, setTexts] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const isDrawing = React.useRef(false);

    // Check click on empty space to deselect
    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
        }
    };

    const handleMouseDown = (e) => {
        checkDeselect(e);
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        if (tool === 'select') return; // Selection handled by individual shape onClick

        isDrawing.current = true;

        if (tool === 'brush' || tool === 'eraser') {
            setLines([...lines, {
                id: `line-${Date.now()}`,
                tool,
                points: [pos.x, pos.y],
                color: tool === 'eraser' ? '#ffffff' : '#df4b26',
                size: tool === 'eraser' ? 20 : 5
            }]);
        } else if (tool === 'rect') {
            setRectangles([...rectangles, {
                id: `rect-${Date.now()}`,
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                color: '#df4b26'
            }]);
        } else if (tool === 'text') {
            setTexts([...texts, {
                id: `text-${Date.now()}`,
                x: pos.x,
                y: pos.y,
                text: 'Double click to edit',
                fontSize: 20,
                color: '#ffffff'
            }]);
            isDrawing.current = false; // Text is click-to-place, not drag
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        if (tool === 'brush' || tool === 'eraser') {
            setLines(prevLines => {
                const newLines = [...prevLines];
                const lastLine = { ...newLines[newLines.length - 1] };
                lastLine.points = lastLine.points.concat([point.x, point.y]);
                newLines[newLines.length - 1] = lastLine;
                return newLines;
            });
        } else if (tool === 'rect') {
            setRectangles(prevRects => {
                const newRects = [...prevRects];
                const lastRect = { ...newRects[newRects.length - 1] };
                lastRect.width = point.x - lastRect.x;
                lastRect.height = point.y - lastRect.y;
                newRects[newRects.length - 1] = lastRect;
                return newRects;
            });
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };


    // Initialize Global Right Panel Setup
    useEffect(() => {
        setRightOpen(step === 'editor');
        if (step === 'editor') {
            setRightPanelMode('MAP'); // Set to new MAP mode

            // Push current settings to global panel
            const initialSettings = {
                showGrid: true,
                gridSize: 50,
                width: formData.dims.width,
                height: formData.dims.height
            };
            setMapSettings(initialSettings);

            // Register callback to receive updates from panel
            setOnMapSettingsChange((newSettings) => {
                if (!newSettings) return;
                // Update local form data when panel changes
                setFormData(prev => ({
                    ...prev,
                    dims: { width: newSettings.width, height: newSettings.height }
                }));
            });
        }
    }, [step]);

    // Resolve Folder ID on Mount IF not provided in state
    useEffect(() => {
        if (initialMode === 'create' && !realFolderId && folderId) {
            console.log("Resolving folder ID for slug:", folderId);
            api.get(`/world-bible/folders/${folderId}`)
                .then(res => setRealFolderId(res.id))
                .catch(err => console.error("Could not resolve folder ID", err));
        }
    }, [initialMode, folderId, realFolderId]);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    setFormData(prev => ({
                        ...prev,
                        bgImage: ev.target.result,
                        dims: { width: img.width, height: img.height }, // Auto-set dims
                        sourceType: 'upload'
                    }));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateFinish = async () => {
        if (!realFolderId) {
            alert("Folder context missing. Please start from the folder view again.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                nombre: formData.name,
                tipoEspecial: 'map',
                carpetaId: realFolderId, // Use resolved numeric ID
                descripcion: JSON.stringify({
                    description: formData.description,
                    type: formData.type,
                    width: formData.dims.width,
                    height: formData.dims.height,
                    bgImage: formData.bgImage ? 'BINARY_DATA' : null,
                    layers: []
                }),
                iconUrl: formData.bgImage // Optional: use map bg as icon
            };

            const res = await api.post('/world-bible/entities', payload);

            // Force sidebar refresh
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: realFolderId } }));

            navigate(`/${username}/${projectName}/map-editor/edit/${res.id}`, { replace: true });

        } catch (err) {
            console.error(err);
            alert("Error creating map. Check console.");
        } finally {
            setSaving(false);
        }
    };

    // Load Entity Data (Edit Mode)
    useEffect(() => {
        // Fix: Use permissive check or explicit check for 'edit'
        if ((!initialMode || initialMode === 'edit') && entityId) {
            api.get(`/world-bible/entities/${entityId}`)
                .then(ent => {
                    setRealFolderId(ent.carpetaId);

                    // Force Editor Mode just in case
                    setStep('editor');

                    // Parse descripcion safely
                    let mapData = {};
                    try {
                        mapData = ent.descripcion ? JSON.parse(ent.descripcion) : {};
                    } catch (e) { console.error("Error parsing map data", e); }

                    setFormData({
                        name: ent.nombre,
                        description: mapData.description || '',
                        parentZone: null,
                        type: mapData.type || 'regional',
                        sourceType: mapData.bgImage ? 'upload' : 'blank',
                        dims: {
                            width: mapData.width || 800,
                            height: mapData.height || 600
                        },
                        bgImage: mapData.bgImage
                    });

                    // Restore Shapes
                    if (mapData.layers) {
                        // TODO: Restore layers to state (lines, rects, texts)
                        // For now we just load the BG and settings
                    }

                    // Sync global settings
                    setMapSettings({
                        name: ent.nombre,
                        description: mapData.description || '',
                        type: mapData.type || 'regional',
                        showGrid: true, // Default
                        gridSize: 50, // Default
                        width: mapData.width || 800,
                        height: mapData.height || 600,
                        bgImage: mapData.bgImage
                    });
                })
                .catch(err => console.error("Error loading entity", err));
        }
    }, [initialMode, entityId]);

    const handleEditorSave = async () => {
        setSaving(true);
        try {
            const payload = {
                id: entityId,
                nombre: formData.name,
                tipoEspecial: 'map',
                carpetaId: realFolderId,
                descripcion: JSON.stringify({
                    description: formData.description,
                    type: formData.type,
                    width: formData.dims.width,
                    height: formData.dims.height,
                    bgImage: formData.bgImage ? 'BINARY_DATA' : null, // Optimize this later
                    layers: []
                }),
                iconUrl: formData.bgImage
            };

            await api.put(`/world-bible/entities/${entityId}`, payload);

            // Navigate back to folder
            if (realFolderId) {
                navigate(`/${username}/${projectName}/bible/folder/${realFolderId}`);
            } else {
                navigate(`/${username}/${projectName}/bible`);
            }
        } catch (err) {
            console.error("Save failed", err);
            alert("Error saving map");
        } finally {
            setSaving(false);
        }
    };

    // --- RENDER: SETUP WIZARD ---
    if (step === 'setup') {
        return (
            <div className="flex-1 flex flex-col h-screen bg-[#060608] text-white">
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <span className="material-symbols-outlined">add_circle</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Create New Map / Zone</h1>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Configure details for your new cartography entry</p>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Main Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* 1. Identity */}
                        <AccordionSection
                            stepNumber="1"
                            title="Identity & Hierarchy"
                            isOpen={wizardSection === 1}
                            onClick={() => setWizardSection(1)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Map Name</label>
                                        <input
                                            autoFocus
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                            placeholder="e.g. The Sapphire Coast"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Parent Zone (Optional)</label>
                                        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-slate-400 flex items-center justify-between cursor-pointer hover:border-white/20">
                                            <span>Current Folder (Default)</span>
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-2">Selecting a parent makes this a sub-zone.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-40 bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-white resize-none focus:border-primary outline-none transition-colors leading-relaxed"
                                        placeholder="Brief description of geography, climate, or importance..."
                                    />
                                </div>
                            </div>
                        </AccordionSection>

                        {/* 2. Type */}
                        <AccordionSection
                            stepNumber="2"
                            title="Map Type"
                            isOpen={wizardSection === 2}
                            onClick={() => setWizardSection(2)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <TypeCard
                                    icon="public"
                                    title="World Map"
                                    desc="Continents, oceans, global scale."
                                    selected={formData.type === 'world'}
                                    onClick={() => setFormData({ ...formData, type: 'world' })}
                                />
                                <TypeCard
                                    icon="map"
                                    title="Regional Map"
                                    desc="Kingdoms, provinces, biomes."
                                    selected={formData.type === 'regional'}
                                    onClick={() => setFormData({ ...formData, type: 'regional' })}
                                />
                                <TypeCard
                                    icon="location_city"
                                    title="City / Local"
                                    desc="Cities, dungeons, battlemaps."
                                    selected={formData.type === 'local'}
                                    onClick={() => setFormData({ ...formData, type: 'local' })}
                                />
                            </div>
                        </AccordionSection>

                        {/* 3. Canvas Source */}
                        <AccordionSection
                            stepNumber="3"
                            title="Canvas Source"
                            isOpen={wizardSection === 3}
                            onClick={() => setWizardSection(3)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Option */}
                                <div
                                    onClick={() => document.getElementById('map-upload-input').click()}
                                    className={`relative p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[200px] ${formData.sourceType === 'upload' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30 bg-[#0a0a0c]'}`}
                                >
                                    <input
                                        id="map-upload-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImport}
                                    />
                                    {formData.bgImage ? (
                                        <img src={formData.bgImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50 group-hover:opacity-70" />
                                    ) : (
                                        <>
                                            <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                                            </div>
                                            <h4 className="font-bold text-white">Upload Image File</h4>
                                            <p className="text-xs text-slate-500 mt-2">Drag & drop or click to browse</p>
                                            <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">JPG, PNG, WEBP • Max 20MB</p>
                                        </>
                                    )}
                                    {formData.sourceType === 'upload' && <div className="absolute top-4 right-4 size-3 bg-primary rounded-full shadow-glow z-10"></div>}
                                </div>

                                {/* Blank Canvas Option */}
                                <div
                                    onClick={() => setFormData({ ...formData, sourceType: 'blank', bgImage: null })}
                                    className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${formData.sourceType === 'blank' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30 bg-[#0a0a0c]'}`}
                                >
                                    <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-3xl text-slate-400">check_box_outline_blank</span>
                                    </div>
                                    <h4 className="font-bold text-white">Blank Canvas</h4>
                                    <p className="text-xs text-slate-500 mt-2">Start a new drawing from scratch</p>

                                    {formData.sourceType === 'blank' && (
                                        <div className="mt-6 flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Size</span>
                                            <span className="text-xs font-mono text-white">4096 px</span>
                                            <span className="text-xs text-slate-500">x</span>
                                            <span className="text-xs font-mono text-white">4096 px</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AccordionSection>

                    </div>
                </div>

                {/* Footer */}
                <div className="h-20 border-t border-white/5 bg-[#0a0a0c] flex items-center justify-between px-8 z-20">
                    <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-600 italic">Changes saved locally</span>
                        <Button
                            variant="primary"
                            size="lg"
                            icon="check"
                            onClick={handleCreateFinish}
                            disabled={!formData.name || saving}
                            className="bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/25 px-8"
                        >
                            {saving ? 'Creating...' : 'Create Map'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: EDITOR ---
    return (
        <div className="flex flex-col h-screen w-full bg-[#0f0f13] text-white overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#1a1a20] shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full" title="Back to Collection">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-transparent font-bold text-sm outline-none focus:bg-white/5 rounded px-2 -ml-2"
                        />
                        <span className="text-[10px] text-text-muted px-2">
                            {formData.dims.width} x {formData.dims.height} • {mapSettings?.gridSize || 50}px Grid
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" icon="save" onClick={handleEditorSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Toolbar */}
                <div className="w-14 bg-[#1a1a20] border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10">
                    {/* Toolbar */}
                    {[
                        { id: 'select', icon: 'near_me' },
                        { id: 'brush', icon: 'brush' },
                        { id: 'eraser', icon: 'ink_eraser' }, // Changed icon specifically for eraser
                        { id: 'rect', icon: 'check_box_outline_blank' },
                        { id: 'text', icon: 'title' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`p-2 rounded-lg transition-colors ${tool === t.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined">{t.icon}</span>
                        </button>
                    ))}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto bg-[#0f0f13] relative flex items-center justify-center p-8 custom-scrollbar">
                    {/* KONVA STAGE */}
                    <div className="bg-[#1a1a20] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex-none">
                        <Stage
                            width={formData.dims.width}
                            height={formData.dims.height}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="bg-white"
                        >
                            <Layer>
                                {/* Background Image */}
                                {formData.bgImage && (
                                    <URLImage
                                        src={formData.bgImage}
                                        x={0}
                                        y={0}
                                        width={formData.dims.width}
                                        height={formData.dims.height}
                                    />
                                )}

                                {/* Grid (Custom rendering) */}
                                {mapSettings?.showGrid && (
                                    <Rect
                                        width={formData.dims.width}
                                        height={formData.dims.height}
                                        fillPatternImage={(() => {
                                            const canvas = document.createElement('canvas');
                                            canvas.width = mapSettings.gridSize || 50;
                                            canvas.height = mapSettings.gridSize || 50;
                                            const ctx = canvas.getContext('2d');
                                            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                                            ctx.lineWidth = 1;
                                            ctx.strokeRect(0, 0, canvas.width, canvas.height);
                                            return canvas;
                                        })()}
                                        listening={false}
                                    />
                                )}
                            </Layer>

                            <Layer>
                                {lines.map((line, i) => (
                                    <Line
                                        key={i}
                                        points={line.points}
                                        stroke={line.color}
                                        strokeWidth={line.size}
                                        tension={0.5}
                                        lineCap="round"
                                        lineJoin="round"
                                        globalCompositeOperation={
                                            line.tool === 'eraser' ? 'destination-out' : 'source-over'
                                        }
                                    />
                                ))}

                                {rectangles.map((rect, i) => (
                                    <Rect
                                        key={rect.id}
                                        id={rect.id}
                                        x={rect.x}
                                        y={rect.y}
                                        width={rect.width}
                                        height={rect.height}
                                        stroke={rect.color}
                                        strokeWidth={2}
                                        draggable={tool === 'select'}
                                        onClick={() => tool === 'select' && setSelectedId(rect.id)}
                                        onTap={() => tool === 'select' && setSelectedId(rect.id)}
                                    />
                                ))}

                                {texts.map((text, i) => (
                                    <KonvaText
                                        key={text.id}
                                        id={text.id}
                                        x={text.x}
                                        y={text.y}
                                        text={text.text}
                                        fontSize={text.fontSize}
                                        fill={text.color}
                                        draggable={tool === 'select'}
                                        onClick={() => tool === 'select' && setSelectedId(text.id)}
                                        onDblClick={(e) => {
                                            // Simple prompt for now
                                            const newText = prompt("Edit text:", text.text);
                                            if (newText !== null) {
                                                const newTexts = texts.slice();
                                                newTexts[i].text = newText;
                                                setTexts(newTexts);
                                            }
                                        }}
                                    />
                                ))}

                                <TransformerComponent selectedId={selectedId} />
                            </Layer>
                        </Stage>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapEditor;
