import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import BibleCard from '../../WorldBible/components/BibleCard';
import Breadcrumbs from '../../../components/common/Breadcrumbs';
import { getHierarchyType, HIERARCHY_TYPES } from '../../../utils/constants/hierarchy_types';
import { Carpeta, Entidad } from '../../../database/types';

interface OutletContext {
    handleCreateEntity: (folderId: number | string, specialType?: string) => void;
    handleDeleteEntity: (id: number, folderId: number | string) => void;
    handleDeleteFolder: (id: number, parentId?: number | null) => void;
    handleCreateSimpleFolder: (parentId?: number | null, type?: string) => void;
    folderSearchTerm: string;
    folderFilterType: string;
}

const FolderView: React.FC = () => {
    const { username, projectName, folderSlug } = useParams<{ username: string; projectName: string; folderSlug: string }>();
    const navigate = useNavigate();
    const {
        handleCreateEntity,
        handleDeleteEntity,
        handleDeleteFolder,
        handleCreateSimpleFolder,
        folderSearchTerm,
        folderFilterType
    } = useOutletContext<OutletContext>();

    const [entities, setEntities] = useState<Entidad[]>([]);
    const [folder, setFolder] = useState<Carpeta | null>(null);
    const [path, setPath] = useState<Carpeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [creationMenuOpen, setCreationMenuOpen] = useState(false);

    // Unified Filter Logic
    const filteredContent = {
        entities: entities.filter(ent => {
            const searchTerm = (folderSearchTerm || '').toLowerCase();
            const matchesSearch = ent.nombre.toLowerCase().includes(searchTerm) || 
                                (ent.descripcion || '').toLowerCase().includes(searchTerm);
            
            if (folderFilterType === 'ALL') return matchesSearch;
            
            // Map types from folderFilterType to entity types if needed
            const matchesType = folderFilterType === 'ALL' ||
                (folderFilterType === 'individual' && (ent.tipo === 'individual' || ent.tipo === 'entidadindividual' || ent.tipo === 'PERSONAJE')) ||
                (folderFilterType === 'location' && (ent.tipo === 'location' || ent.tipo === 'zona' || ent.tipo === 'LUGAR')) ||
                (folderFilterType === 'culture' && (ent.tipo === 'culture' || ent.tipo === 'entidadcolectiva' || ent.tipo === 'CULTURA')) ||
                (folderFilterType === ent.tipo);
                
            return matchesSearch && matchesType;
        })
    };

    useEffect(() => {
        const handleUpdate = (e: any) => {
            const { folderId } = e.detail || {};
            // If we are in the affected folder
            if (folderId === folder?.id || folderId === Number(folderSlug)) {
                loadFolderContent();
            }
        };
        window.addEventListener('folder-update', handleUpdate);
        return () => window.removeEventListener('folder-update', handleUpdate);
    }, [folderSlug, folder?.id]);

    useEffect(() => {
        loadFolderContent();
    }, [folderSlug]);

    const loadFolderContent = async () => {
        if (!folderSlug) return;
        setLoading(true);
        try {
            // In our current local-first, folderSlug IS the ID (as a string)
            const fId = Number(folderSlug);
            const [fInfo, ents] = await Promise.all([
                folderService.getById(fId),
                entityService.getByFolder(fId)
            ]);

            if (fInfo) {
                setFolder(fInfo);
                setEntities(ents);
                const breadcrumbs = await folderService.getPath(fId);
                setPath(breadcrumbs);
            } else {
                setFolder(null);
            }
        } catch (err) {
            console.error("Error loading folder content:", err);
            setFolder(null);
            setPath([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Cargando Sector...</div>
        </div>
    );

    if (!folder) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-500">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">folder_off</span>
                <h2 className="text-xl font-bold opacity-50">Sector No Encontrado</h2>
                <p className="text-sm opacity-30 mt-2 text-center max-w-xs">El sector que buscas no existe en los registros actuales.</p>
                <Link to={`/local/${projectName}/bible`} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5">
                    Volver al Origen
                </Link>
            </div>
        );
    }

    const typeInfo = getHierarchyType(folder.tipo);
    const isDashboard = ['UNIVERSE', 'GALAXY', 'SYSTEM', 'PLANET'].includes(folder.tipo);

    if (isDashboard) {
        return (
            <div className="flex-1 overflow-y-auto bg-[#0a0a0c] text-white w-full h-full relative custom-scrollbar">
                <div className={`w-full min-h-[300px] ${typeInfo.bgColor} relative flex items-end p-10 border-b border-white/5`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-80 pointer-events-none"></div>

                    <div className="absolute top-6 left-10 z-20">
                        <Breadcrumbs path={path} currentFolder={folder} />
                    </div>

                    <div className="relative z-10 flex gap-8 items-end w-full max-w-7xl mx-auto">
                        <div className={`w-32 h-32 rounded-3xl ${typeInfo.bgColor} border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl group transition-transform hover:scale-105`}>
                            <span className={`material-symbols-outlined text-6xl ${typeInfo.color} transition-all group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]`}>{typeInfo.icon}</span>
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${typeInfo.bgColor} ${typeInfo.color}`}>
                                    {typeInfo.label}
                                </div>
                                <span className="text-white/30 text-xs font-mono tracking-widest uppercase opacity-40">INDEX: 0x{folder.id.toString(16).toUpperCase()}</span>
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter text-white mb-2">{folder.nombre}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)}
                                className="px-5 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-indigo-500/20"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span> Nueva Entidad
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Métricas del Sector</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-2xl font-black text-white">{entities.length}</div>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Entidades</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Registros de Campo</h3>
                        {entities.length === 0 && (
                            <div className="p-16 border border-dashed border-white/10 rounded-[3rem] text-center bg-white/[0.01]">
                                <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">database</span>
                                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sin registros en este sector</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredContent.entities.map(entity => (
                                <BibleCard
                                    key={entity.id}
                                    item={entity}
                                    type="entity"
                                    linkTo={`/local/${projectName}/bible/folder/${folder.id}/entity/${entity.id}`}
                                    onDelete={() => handleDeleteEntity(entity.id, folder.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
            <header className="mb-10 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Breadcrumbs path={path} currentFolder={folder} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${typeInfo.bgColor} border border-white/5 flex items-center justify-center shadow-lg`}>
                            <span className={`material-symbols-outlined text-2xl ${typeInfo.color}`}>{typeInfo.icon}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 ${typeInfo.bgColor} ${typeInfo.color}`}>{typeInfo.label}</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">{folder.nombre}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setCreationMenuOpen(!creationMenuOpen)}
                        className="h-12 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-400 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 border border-indigo-400/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Añadir Registro</span>
                    </button>

                    {creationMenuOpen && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden backdrop-blur-3xl">
                            <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">Categorías</div>
                            <button onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)} className="w-full px-5 py-3 hover:bg-indigo-500/10 text-left text-xs font-bold flex items-center gap-4 text-slate-400 hover:text-indigo-400 transition-all">
                                <span className="material-symbols-outlined text-lg text-indigo-500/50">person</span> Personaje
                            </button>
                            <button onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadcolectiva`)} className="w-full px-5 py-3 hover:bg-sky-500/10 text-left text-xs font-bold flex items-center gap-4 text-slate-400 hover:text-sky-400 transition-all">
                                <span className="material-symbols-outlined text-lg text-sky-500/50">groups</span> Cultura / Grupo
                            </button>
                            <button onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/zona`)} className="w-full px-5 py-3 hover:bg-emerald-500/10 text-left text-xs font-bold flex items-center gap-4 text-slate-400 hover:text-emerald-400 transition-all">
                                <span className="material-symbols-outlined text-lg text-emerald-500/50">location_on</span> Lugar / Geografía
                            </button>
                            <div className="h-px bg-white/5 my-2" />
                            <button onClick={() => handleCreateSimpleFolder(folder.id, 'TIMELINE')} className="w-full px-5 py-3 hover:bg-orange-500/10 text-left text-xs font-bold flex items-center gap-4 text-slate-400 hover:text-orange-400 transition-all">
                                <span className="material-symbols-outlined text-lg text-orange-500/50">history</span> Nueva Timeline
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* Entities */}
                {filteredContent.entities.map(entity => (
                    <BibleCard
                        key={entity.id}
                        item={entity}
                        type="entity"
                        linkTo={`/local/${projectName}/bible/folder/${folder.id}/entity/${entity.id}`}
                        onDelete={() => handleDeleteEntity(entity.id, folder.id)}
                    />
                ))}
            </div>

            {entities.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
                    <span className="material-symbols-outlined text-5xl text-slate-800 mb-4">inventory_2</span>
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-sm">Archivo Vacío</p>
                </div>
            )}
        </div>
    );
};

export default FolderView;
