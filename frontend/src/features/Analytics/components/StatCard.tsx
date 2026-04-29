import React from 'react';
import GlassPanel from '@atoms/GlassPanel';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, isLoading }) => {
  return (
    <GlassPanel className="p-6 border-b-4 border-b-transparent hover:border-b-primary transition-all group relative overflow-hidden">
      {/* Sutil gradiente de fondo basado en el color de la card */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-current ${color}`}></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
        {isLoading && <div className="size-4 rounded-full border-2 border-foreground/10 border-t-primary animate-spin"></div>}
      </div>
      
      <motion.div 
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-foreground mb-1 relative z-10"
      >
        {isLoading ? '...' : value}
      </motion.div>
      
      <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest relative z-10">{label}</div>
    </GlassPanel>
  );
};

export default StatCard;
