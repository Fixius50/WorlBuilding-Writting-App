import React from 'react';
import GlassPanel from '../../../components/common/GlassPanel';

const SpecializedTimeline = ({ entity, active }) => {
    if (!active) return null;

    const events = [
        { year: '450 BE', title: 'The Great Fracture', desc: 'The world split into three continents.' },
        { year: '102 AE', title: 'Rise of the First King', desc: 'Unification of the northern tribes.' },
        { year: 'Present', title: 'Current Era', desc: 'The age of uncertain peace.' },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto p-4 animate-slide-up">
            <div className="relative border-l-2 border-white/10 ml-6 space-y-12 py-8">
                {events.map((evt, i) => (
                    <div key={i} className="relative pl-12 group">
                        {/* Dot */}
                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-background-dark border-2 border-primary group-hover:scale-125 group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>

                        <GlassPanel className="p-6 border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 cursor-pointer">
                            <span className="text-xs font-black text-primary uppercase tracking-widest mb-1 block">{evt.year}</span>
                            <h3 className="text-xl font-bold text-white mb-2">{evt.title}</h3>
                            <p className="text-sm text-text-muted leading-relaxed">{evt.desc}</p>
                        </GlassPanel>
                    </div>
                ))}

                {/* Add Event Button */}
                <div className="relative pl-12 group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                    <div className="absolute left-[-9px] top-2 size-4 rounded-full bg-background-dark border-2 border-dashed border-white/30"></div>
                    <div className="p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-text-muted hover:border-primary/50 hover:text-white transition-all">
                        <span className="material-symbols-outlined mr-2">add_circle</span>
                        <span className="text-xs font-black uppercase tracking-widest">Add Historical Event</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecializedTimeline;
