import React from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import GlassPanel from '../components/common/GlassPanel';

const ActionCard = ({ icon, title, desc, color, onClick }) => (
    <div
        onClick={onClick}
        className="group relative p-8 rounded-[32px] bg-surface-dark border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col h-full gap-6 hover:shadow-2xl hover:shadow-black/40"
    >
        <div className={`size-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-500`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
            <span>Explorar Herramienta</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
    </div>
);

const ProjectView = () => {
    const { projectName } = useOutletContext();
    const navigate = useNavigate();
    const { username } = useParams();

    const baseUrl = `/${username}/${projectName}`;

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-dark">
            {/* Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-surface-dark/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                        <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">{projectName}</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Panel de Control del Arquitecto</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="size-8 rounded-full border-2 border-surface-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                <span className="material-symbols-outlined text-xs">person</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto p-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Welcome Section */}
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">
                            Bienvenido, <span className="text-indigo-400">Arquitecto</span>.
                        </h2>
                        <p className="text-slate-400 text-lg font-serif italic leading-relaxed opacity-80">
                            Tu mundo está esperando ser esculpido. Utiliza el Codex para documentar entidades, el Atlas para trazar geografías o las Crónicas para escribir su historia.
                        </p>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ActionCard
                            icon="menu_book"
                            title="Codex Mundial"
                            desc="Documenta personajes, lugares, grupos y objetos. Es la base de conocimiento de tu universo."
                            color="bg-indigo-600 shadow-indigo-500/20"
                            onClick={() => navigate(`${baseUrl}/bible`)}
                        />
                        <ActionCard
                            icon="map"
                            title="Atlas Interactivo"
                            desc="Crea y gestiona mapas detallados con marcadores interactivos conectados a tu Codex."
                            color="bg-emerald-600 shadow-emerald-500/20"
                            onClick={() => navigate(`${baseUrl}/map`)}
                        />
                        <ActionCard
                            icon="edit_note"
                            title="Las Crónicas"
                            desc="El editor zen para tus relatos, capítulos y fragmentos de lore. Organizado por hojas."
                            color="bg-amber-600 shadow-amber-500/20"
                            onClick={() => navigate(`${baseUrl}/writing`)}
                        />
                        <ActionCard
                            icon="hub"
                            title="Red de Relaciones"
                            desc="Visualiza las conexiones entre tus entidades mediante un grafo dinámico e interactivo."
                            color="bg-purple-600 shadow-purple-500/20"
                            onClick={() => navigate(`${baseUrl}/graph`)}
                        />
                        <ActionCard
                            icon="calendar_month"
                            title="Líneas Temporales"
                            desc="Traza la cronología de eventos históricos y la progresión de tus relatos."
                            color="bg-rose-600 shadow-rose-500/20"
                            onClick={() => navigate(`${baseUrl}/timeline`)}
                        />
                        <ActionCard
                            icon="translate"
                            title="Forja Lingüística"
                            desc="Herramientas para la creación de conlangs, diccionarios y gramáticas únicas."
                            color="bg-blue-600 shadow-blue-500/20"
                            onClick={() => navigate(`${baseUrl}/linguistics`)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectView;
