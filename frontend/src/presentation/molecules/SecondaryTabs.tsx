import React from 'react';
import { motion } from 'framer-motion';

interface TabOption {
  id: string;
  label: string;
  icon?: string;
}

interface SecondaryTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const SecondaryTabs: React.FC<SecondaryTabsProps> = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-foreground/10 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`group relative flex items-center gap-2 px-6 py-4 transition-all ${
            activeTab === tab.id ? 'text-primary' : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          {tab.icon && (
            <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${
              activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
            }`}>
              {tab.icon}
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {tab.label}
          </span>
          
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default SecondaryTabs;
