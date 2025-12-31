import React from 'react';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../components/common/GlassPanel';

const ActionCard = ({ icon, title, desc, color }) => (
    <div className="group relative p-8 rounded-[32px] bg-surface-dark border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col h-full gap-6 hover:shadow-2xl hover:shadow-black/40">
        <div className={`size-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-500`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 group-hover:text-white transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest">Architect Tool</span>
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
    </div>
);

const ProjectView = () => {
    // We can access sidebar controls if needed, but for now we match the image
    const { projectName } = useOutletContext();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 gap-16 max-w-6xl mx-auto w-full">
            <div className="flex flex-col items-center text-center gap-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="size-20 rounded-full bg-white text-background-dark flex items-center justify-center shadow-2xl shadow-white/20">
                    <span className="material-symbols-outlined text-4xl font-bold">explore</span>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-manrope font-black text-white tracking-tighter leading-tight">
                        Bienvenido de nuevo, Viajero.
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">
                        Tu mundo <span className="text-primary font-bold">{projectName || 'Cargando...'}</span> espera ser descubierto. El lienzo está vacío, pero tu imaginación no tiene límites. ¿Cómo empezamos hoy?
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-stretch animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                <ActionCard
                    icon="person_add"
                    title="Añadir Entidad"
                    desc="Agrega un personaje, lugar o item importante a tu base de datos."
                    color="bg-indigo-600"
                />
                <ActionCard
                    icon="map"
                    title="Crear Mapa"
                    desc="Dibuja una representación cartográfica de una región."
                    color="bg-purple-600"
                />
                <ActionCard
                    icon="edit_note"
                    title="Empezar a Escribir"
                    desc="Abre el editor de texto y comienza un nuevo capítulo."
                    color="bg-emerald-600"
                />
                <ActionCard
                    icon="lightbulb"
                    title="Ver Ideas Rápidas"
                    desc="Revisa tus notas y fragmentos de inspiración guardados."
                    color="bg-amber-600"
                />
            </div>
        </div>
    );
};

export default ProjectView;
