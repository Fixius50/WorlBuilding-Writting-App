import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../js/services/api';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const EntityProfile = () => {
    const { username, projectName, folderSlug, entitySlug } = useParams();
    const [entity, setEntity] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEntity();
    }, [entitySlug]);

    const loadEntity = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/entities/${entitySlug}`);
            setEntity(data);
        } catch (err) {
            console.error("Failed to load entity", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-white/50">Accessing Archives...</div>;
    if (!entity) return <div className="p-20 text-center text-red-400">Entity not found.</div>;

    // Derived Data
    const attributes = (entity.valores || []).map(val => ({
        label: val.plantilla.nombre,
        value: val.valor,
        type: val.plantilla.tipo
    })).filter(a => ['number', 'text', 'short_text'].includes(a.type));

    // Simple Relation Mock until backend relation graph is fully wired
    const relationships = (entity.valores || [])
        .filter(v => v.plantilla.tipo === 'entity_link' && v.valor)
        .map(v => ({
            name: "Linked Entity (ID: " + v.valor + ")",
            role: v.plantilla.nombre,
            type: "Link"
        }));

    return (
        <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">

            {/* --- HEADER --- */}
            <header className="flex flex-col lg:flex-row items-start gap-8 mb-12">
                <div className="relative group">
                    <Avatar name={entity.nombre} size="xl" className="size-32 lg:size-40 rounded-3xl border-2 border-primary/30 ring-4 ring-primary/10 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 size-8 rounded-lg bg-primary flex items-center justify-center text-white border-4 border-background-dark shadow-lg">
                        <span className="material-symbols-outlined text-sm">verified</span>
                    </div>
                </div>

                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl lg:text-5xl font-manrope font-black text-white tracking-tight leading-none">{entity.nombre}</h1>
                                {entity.carpeta && (
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                        {entity.carpeta.nombre}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {entity.tags && entity.tags.split(',').map((tag, i) => (
                                    <span key={i} className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link to={`/${username}/${projectName}/bible/folder/${folderSlug}/entity/${entitySlug}/edit`}>
                            <Button variant="primary" icon="edit" size="sm">Edit Mode</Button>
                        </Link>
                    </div>

                    <p className="text-lg text-slate-400 leading-relaxed max-w-3xl line-clamp-3">
                        {entity.descripcion || "No description provided."}
                    </p>
                </div>
            </header>

            {/* --- TABS --- */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
                {['overview', 'chronology', 'relationships'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- MAIN CONTENT --- */}
                <div className="lg:col-span-2 space-y-8">

                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Core Stats */}
                            <GlassPanel className="p-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Core Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {attributes.map((attr, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-white capitalize">{attr.label}</span>
                                                <span className="text-xs font-black text-slate-500">{String(attr.value).substring(0, 20)}</span>
                                            </div>
                                            {/* Render bar only if numeric enough */}
                                            {!isNaN(parseFloat(attr.value)) && (
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full`}
                                                        style={{ width: `${Math.min(parseFloat(attr.value), 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {attributes.length === 0 && <div className="text-sm text-slate-500 italic col-span-2">No numeric attributes defined.</div>}
                                </div>
                            </GlassPanel>

                            {/* Full Bio */}
                            <GlassPanel className="p-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Complete Backstory</h3>
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                    {entity.descripcion?.split('\n').map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                            </GlassPanel>
                        </div>
                    )}

                    {activeTab === 'chronology' && (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-4">history_edu</span>
                            <p className="text-sm text-slate-500">Timeline events will appear here.</p>
                        </div>
                    )}

                    {activeTab === 'relationships' && (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-4">hub</span>
                            <p className="text-sm text-slate-500">Relationship graph visualization coming soon.</p>
                        </div>
                    )}

                </div>

                {/* --- RIGHT SIDEBAR --- */}
                <div className="space-y-8">
                    {/* Metadata Card */}
                    <GlassPanel className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Quick Details</h3>
                            <button className="text-slate-600 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">settings</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-xs text-slate-500">ID</span>
                                <span className="text-xs font-mono text-white/50">{entity.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-xs text-slate-500">Folder</span>
                                <Link to={`/${username}/${projectName}/bible/folder/${folderSlug}`} className="text-xs font-bold text-primary hover:underline">
                                    {entity.carpeta?.nombre}
                                </Link>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-xs text-slate-500">Last Edited</span>
                                <span className="text-xs text-white">Just now</span>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Linked Entities */}
                    {relationships.length > 0 && (
                        <GlassPanel className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Linked Beings</h3>
                            <div className="space-y-3">
                                {relationships.map((rel, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">L</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-white truncate">{rel.name}</div>
                                            <div className="text-[10px] text-slate-500">{rel.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntityProfile;
