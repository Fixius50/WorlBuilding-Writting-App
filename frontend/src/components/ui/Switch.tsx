import React from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      {label && <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{label}</span>}
      <div 
        className="relative"
        onClick={() => !disabled && onChange(!checked)}
      >
        <div className={`w-10 h-5 transition-colors duration-300 rounded-full border border-foreground/10 ${checked ? 'bg-primary/40' : 'bg-foreground/5'}`} />
        <motion.div
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-lg border border-foreground/20 ${checked ? 'bg-primary' : 'bg-foreground/40'}`}
        />
      </div>
    </label>
  );
};

export default Switch;
