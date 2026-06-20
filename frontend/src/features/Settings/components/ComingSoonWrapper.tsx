import React from "react";

interface ComingSoonWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
  tooltipText?: string;
}

const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({
  children,
  enabled = true,
  tooltipText,
}) => {
  if (!enabled) return <>{children}</>;

  return (
    <div className="relative group cursor-not-allowed">
      <div className="blur-[2px] opacity-70 pointer-events-none filter grayscale-[0.5] transition-all">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-red-600/90 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl rotate-[-4deg] border border-white/20  animate-pulse">
          Próximamente
        </div>
      </div>

      <div className="absolute inset-0 z-20 bg-transparent"></div>

      {tooltipText ? (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-background border border-foreground/10 text-[9px] font-black uppercase tracking-wider text-foreground rounded-none shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 text-center">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground/10"></div>
        </div>
      ) : null}
    </div>
  );
};

export default ComingSoonWrapper;
