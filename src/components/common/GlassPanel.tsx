import React from 'react';
import { twMerge } from "tailwind-merge";
import { IconProps } from '../../types/ui';

interface GlassPanelProps extends IconProps {
 title?: string;
 [key: string]: any;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className, title, icon, ...props }) => {
 return (
 <div
 className={twMerge(
 "monolithic-panel rounded-none overflow-hidden flex flex-col transition-all duration-500 hover:border-indigo-500/20 group",
 className
 )}
 {...props}
 >
 {(title || icon) && (
 <div className="px-6 py-4 border-b border-foreground/10 bg-white/[0.02] flex items-center justify-between">
 <div className="flex items-center gap-3">
 {icon && (
 <span className="material-symbols-outlined text-indigo-500/50 group-hover:text-indigo-400 transition-colors text-lg">
 {icon}
 </span>
 )}
 {title && (
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 group-hover:text-foreground/60 transition-colors">
 {title}
 </h3>
 )}
 </div>
 </div>
 )}
 <div className="p-6 flex-1">
 {children}
 </div>
 </div>
 );
};

export default GlassPanel;
