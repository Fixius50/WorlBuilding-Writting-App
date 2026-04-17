import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MentionHoverCardProps {
 x: number;
 y: number;
 data: {
 label: string;
 type: string | null;
 desc: string | null;
 id: string | null;
 };
 onClose: () => void;
}

const MentionHoverCard: React.FC<MentionHoverCardProps> = ({ x, y, data, onClose }) => {
 const cardRef = useRef<HTMLDivElement>(null);
 const [style, setStyle] = useState({ top: y, left: x, opacity: 0, transform: 'translateY(10px)' });

 useEffect(() => {
 if (cardRef.current) {
 const rect = cardRef.current.getBoundingClientRect();
 const viewportWidth = window.innerWidth;
 const viewportHeight = window.innerHeight;

 let top = y + 20;
 let left = x;

 // Prevent going off-screen matching logic
 if (left + rect.width > viewportWidth - 20) {
 left = viewportWidth - rect.width - 20;
 }
 if (top + rect.height > viewportHeight - 20) {
 top = y - rect.height - 10;
 }

 setStyle({
 top,
 left,
 opacity: 1,
 transform: 'translateY(0)'
 });
 }
 }, [x, y]);

 if (!data) return null;

 const getColors = (type: string | null) => {
 const t = (type || 'generic').toLowerCase();
 switch (t) {
 case 'individual': return { border: 'border-indigo-500/50', text: 'text-indigo-400', bg: 'bg-indigo-950/90' };
 case 'location': return { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-950/90' };
 case 'group': return { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-950/90' };
 case 'timeline': return { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-950/90' };
 case 'event': return { border: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-950/90' };
 case 'item': return { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-950/90' };
 default: return { border: 'border-foreground/10/50', text: 'text-foreground/60', bg: 'bg-foreground/5' };
 }
 };

 const colors = getColors(data.type);

 return createPortal(
 <div
 ref={cardRef}
 className={`mention-card-portal fixed z-[9999] pointer-events-auto p-4 rounded-none shadow-2xl border flex flex-col gap-2 w-64 transition-all duration-300 ${colors.bg} ${colors.border}`}
 style={{
 top: style.top,
 left: style.left,
 opacity: style.opacity,
 transform: style.opacity === 0 ? 'translateY(10px)' : 'translateY(0)'
 }}
 >
 <div className="flex items-center justify-between border-b border-foreground/40 pb-2">
 <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>{data.type || 'ENTITY'}</span>
 <span className="material-symbols-outlined text-[14px] opacity-50 text-foreground">info</span>
 </div>

 <h4 className="text-lg font-serif font-bold text-foreground leading-tight">
 {data.label}
 </h4>

 {data.desc && (
 <p className="text-xs text-foreground/60 leading-relaxed font-sans line-clamp-4">
 {data.desc}
 </p>
 )}

 {!data.desc && (
 <p className="text-[10px] text-foreground/60 italic">No additional details available.</p>
 )}
 </div>,
 document.body
 );
};

export default MentionHoverCard;
