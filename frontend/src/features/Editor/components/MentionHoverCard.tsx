import React from 'react';
import { createPortal } from 'react-dom';
import { useMentionHoverCard } from '../hooks/useMentionHoverCard';

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
  const { cardRef, style, getColors } = useMentionHoverCard(x, y);

  if (!data) return null;

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


