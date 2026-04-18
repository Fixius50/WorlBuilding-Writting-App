import React from 'react';

interface ComingSoonWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Un componente que envuelve a otros elementos para mostrar un estado de "Próximamente"
 * con blur y un banner rojo sobre el contenido.
 */
const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ children, enabled = true }) => {
  if (!enabled) return <>{children}</>;

  return (
    <div className="relative group cursor-not-allowed">
      {/* Contenido con Blur */}
      <div className="blur-[2px] opacity-70 pointer-events-none filter grayscale-[0.5] transition-all">
        {children}
      </div>

      {/* Banner de Próximamente */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-red-600/90 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl rotate-[-4deg] border border-white/20 backdrop-blur-sm animate-pulse">
          Próximamente
        </div>
      </div>

      {/* Overlay transparente para bloquear clicks */}
      <div className="absolute inset-0 z-20 bg-transparent"></div>
    </div>
  );
};

export default ComingSoonWrapper;
