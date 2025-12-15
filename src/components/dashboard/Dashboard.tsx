import { LucideIcon, MapIcon, ScrollText, Database } from 'lucide-react';
import React from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

interface DashboardProps {
  onNavigate: (view: 'map' | 'editor' | 'entities') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { mode } = useThemeStore();
  const isDetailed = mode === 'detailed';

  return (
    <div className={`h-full w-full overflow-y-auto p-8 animate-in fade-in duration-500
        ${isDetailed
        ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1b26] to-[#0a0a0f]'
        : ''}
    `}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className={`text-5xl font-bold mb-4 drop-shadow-md tracking-tight transition-all duration-500
            ${isDetailed
            ? 'font-serif text-amber-100/90 text-[3.5rem] tracking-wide'
            : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent'}
        `}>
          Chronos Atlas
        </h1>
        <p className={`text-xl max-w-2xl mx-auto italic transition-all duration-500
            ${isDetailed ? 'text-amber-500/60 font-serif' : 'text-muted-foreground'}
        `}>
          "The loom upon which worlds are woven and histories are unraveled."
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <DashboardCard
          title="Explore World"
          description="View the cartography of your known realms."
          icon={MapIcon}
          onClick={() => onNavigate('map')}
          color="text-emerald-400"
          borderColor="border-emerald-900/50"
          glowColor="group-hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]"
          isDetailed={isDetailed}
        />
        <DashboardCard
          title="Chronicler"
          description="Weave the threads of history and events."
          icon={ScrollText}
          onClick={() => onNavigate('editor')}
          color="text-amber-400"
          borderColor="border-amber-900/50"
          glowColor="group-hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          isDetailed={isDetailed}
        />
        <DashboardCard
          title="Compendium"
          description="Manage the entities that inhabit your cosmos."
          icon={Database}
          onClick={() => onNavigate('entities')}
          color="text-purple-400"
          borderColor="border-purple-900/50"
          glowColor="group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
          isDetailed={isDetailed}
        />
      </div>

      {/* Recent Activity / Stats Section */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10">
          <h2 className={`text-2xl transition-colors ${isDetailed ? 'font-serif text-amber-100/80' : 'text-white/80'}`}>
            Recent Echoes
          </h2>
          {isDetailed && <div className="h-px flex-1 bg-gradient-to-r from-amber-900/50 to-transparent" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg backdrop-blur-sm transition-all duration-500
                ${isDetailed
              ? 'bg-[#15161c] border border-[#2a2b35] shadow-lg shadow-black/40'
              : 'bg-black/20 border border-white/5'}
            `}>
            <h3 className={`text-lg font-medium mb-4 ${isDetailed ? 'text-amber-200/70 font-serif' : 'text-white/70'}`}>World Status</h3>
            <div className="space-y-3">
              <StatRow label="Active Timeline" value="Prime Material" isDetailed={isDetailed} />
              <StatRow label="Entities Tracked" value="1,243" isDetailed={isDetailed} />
              <StatRow label="Map Layers" value="8" isDetailed={isDetailed} />
            </div>
          </div>
          <div className={`p-6 rounded-lg backdrop-blur-sm transition-all duration-500
                ${isDetailed
              ? 'bg-[#15161c] border border-[#2a2b35] shadow-lg shadow-black/40'
              : 'bg-black/20 border border-white/5'}
            `}>
            <h3 className={`text-lg font-medium mb-4 ${isDetailed ? 'text-amber-200/70 font-serif' : 'text-white/70'}`}>Latest Updates</h3>
            <div className="space-y-4">
              <ActivityItem text="Modified 'Kingdom of Camelot' boundaries" time="2h ago" isDetailed={isDetailed} />
              <ActivityItem text="Added 'Excalibur' artifact" time="5h ago" isDetailed={isDetailed} />
              <ActivityItem text="Updated timeline: 'The Great War'" time="1d ago" isDetailed={isDetailed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  borderColor,
  glowColor,
  isDetailed
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
  borderColor: string;
  glowColor: string;
  isDetailed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative p-6 rounded-xl transition-all duration-300 text-left
        hover:scale-[1.02] hover:-translate-y-1 ${glowColor}
        ${isDetailed
          ? 'bg-[#15161c] border border-[#3a3b45] shadow-xl hover:border-amber-900/50'
          : `border bg-card/40 backdrop-blur-sm ${borderColor}`}
      `}
    >
      <div className={`p-3 rounded-lg w-fit mb-4 transition-colors
        ${isDetailed ? 'bg-black/40 border border-white/5' : 'bg-white/5 group-hover:bg-white/10'}
      `}>
        <Icon className={`w-8 h-8 ${color} ${isDetailed ? 'opacity-90' : ''}`} />
      </div>
      <h3 className={`text-xl font-bold mb-2 transition-colors
        ${isDetailed ? 'text-amber-100/90 font-serif tracking-wide' : 'text-white/90 group-hover:text-white'}
      `}>
        {title}
      </h3>
      <p className={`text-sm transition-colors
        ${isDetailed ? 'text-slate-400' : 'text-muted-foreground group-hover:text-white/60'}
      `}>
        {description}
      </p>
    </button>
  );
}

function StatRow({ label, value, isDetailed }: { label: string; value: string; isDetailed: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={isDetailed ? 'text-slate-400' : 'text-muted-foreground'}>{label}</span>
      <span className={`font-mono ${isDetailed ? 'text-amber-500/80' : 'text-white/80'}`}>{value}</span>
    </div>
  )
}

function ActivityItem({ text, time, isDetailed }: { text: string; time: string; isDetailed: boolean }) {
  return (
    <div className={`flex justify-between items-start gap-4 text-sm pl-3 border-l-2 ${isDetailed ? 'border-amber-900/30' : 'border-white/5'}`}>
      <span className={isDetailed ? 'text-slate-300' : 'text-white/70'}>{text}</span>
      <span className={`text-xs whitespace-nowrap ${isDetailed ? 'text-slate-500' : 'text-muted-foreground'}`}>{time}</span>
    </div>
  )
}
