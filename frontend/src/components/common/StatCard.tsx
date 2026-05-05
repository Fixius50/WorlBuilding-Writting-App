import React from 'react';
import MonolithicPanel from '@atoms/MonolithicPanel';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <MonolithicPanel className="p-6 flex items-center gap-5 hover:border-foreground/40 transition-all cursor-default">
    <div className={`size-12 rounded-none bg-background flex items-center justify-center ${color} shadow-lg`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">{title}</p>
      <p className="text-2xl font-black text-foreground">{value}</p>
    </div>
  </MonolithicPanel>
);
