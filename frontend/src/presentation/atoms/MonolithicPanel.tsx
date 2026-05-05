import React from 'react';
import { twMerge } from "tailwind-merge";
import { IconProps } from '@domain/models/ui';

interface MonolithicPanelProps extends IconProps {
  title?: string;
  [key: string]: unknown;
}

const MonolithicPanel: React.FC<MonolithicPanelProps> = ({ children, className, title, icon, ...props }) => {
  return (
    <div
      className={twMerge(
        "monolithic-panel rounded-none overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/30 group",
        className
      )}
      {...props}
    >
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-lg">
                {icon}
              </span>
            )}
            {title && (
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 group-hover:text-foreground transition-colors">
                {title}
              </h3>
            )}
          </div>
        </div>
      )}
      <div className="p-6 flex-1 bg-background">
        {children}
      </div>
    </div>
  );
};

export default MonolithicPanel;
