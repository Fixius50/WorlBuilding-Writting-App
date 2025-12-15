import React from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { Cloud, Save, RotateCw, Database, Monitor, Shield } from 'lucide-react';

export function Settings() {
    const { status, lastSyncTime } = useSyncStore();
    const { mode } = useThemeStore();
    const isDetailed = mode === 'detailed';

    return (
        <div className={`h-full w-full overflow-y-auto p-8 animate-in slide-in-from-bottom-4 duration-500
            ${isDetailed ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1b26] via-[#0c0d12] to-[#050508]' : ''}
        `}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 className={`text-3xl font-bold mb-2 ${isDetailed ? 'font-serif text-amber-100/90 tracking-wide' : ''}`}>
                        Configuration
                    </h1>
                    <p className={`text-sm ${isDetailed ? 'text-amber-500/60 font-serif' : 'text-muted-foreground'}`}>
                        Manage your world's connection to the causal flow.
                    </p>
                </div>

                {/* Sync Status Card */}
                <div className={`rounded-xl p-6 mb-8 transition-all duration-500
                    ${isDetailed
                        ? 'bg-[#15161c] border border-[#3a3b45] shadow-lg relative overflow-hidden'
                        : 'bg-card border border-border'}
                `}>
                    {isDetailed && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent" />}

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${isDetailed ? 'bg-black/40 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className={`text-lg font-bold ${isDetailed ? 'text-amber-100' : ''}`}>Sync Status</h2>
                                <p className={`text-sm ${isDetailed ? 'text-slate-400' : 'text-muted-foreground'}`}>
                                    PowerSync Cloud Connection
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium border
                            ${status === 'synced'
                                ? (isDetailed ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                        `}>
                            {status === 'synced' ? 'Synchronized' : 'Syncing...'}
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg flex items-center justify-between
                        ${isDetailed ? 'bg-black/30 border border-white/5' : 'bg-secondary/50'}
                    `}>
                        <div className="flex items-center gap-3">
                            <RotateCw className={`w-4 h-4 ${status === 'syncing' ? 'animate-spin' : ''} ${isDetailed ? 'text-slate-400' : ''}`} />
                            <span className={`text-sm ${isDetailed ? 'text-slate-300' : 'text-muted-foreground'}`}>
                                Last sync: <span className={isDetailed ? 'text-amber-500 font-mono' : 'text-foreground'}>{lastSyncTime?.toLocaleTimeString() || 'Never'}</span>
                            </span>
                        </div>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${isDetailed
                                ? 'bg-[#2a2b35] hover:bg-[#3a3b45] text-amber-100 border border-white/5 shadow-black/50'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'}
                        `}>
                            Sync Now
                        </button>
                    </div>
                </div>

                {/* Local Database Card */}
                <div className={`rounded-xl p-6 transition-all duration-500
                    ${isDetailed
                        ? 'bg-[#15161c] border border-[#3a3b45] shadow-lg'
                        : 'bg-card border border-border'}
                `}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-lg ${isDetailed ? 'bg-black/40 text-purple-400' : 'bg-purple-500/10 text-purple-500'}`}>
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${isDetailed ? 'text-amber-100' : ''}`}>Local Database</h2>
                            <p className={`text-sm ${isDetailed ? 'text-slate-400' : 'text-muted-foreground'}`}>
                                SQLite Storage (Browser)
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border flex flex-col gap-2 ${isDetailed ? 'bg-black/20 border-white/5' : 'bg-background border-border'}`}>
                            <span className={`text-xs uppercase font-bold tracking-wider ${isDetailed ? 'text-slate-500' : 'text-muted-foreground'}`}>Usage</span>
                            <span className={`text-2xl font-mono ${isDetailed ? 'text-amber-500' : ''}`}>2.4 MB</span>
                        </div>
                        <div className={`p-4 rounded-lg border flex flex-col gap-2 ${isDetailed ? 'bg-black/20 border-white/5' : 'bg-background border-border'}`}>
                            <span className={`text-xs uppercase font-bold tracking-wider ${isDetailed ? 'text-slate-500' : 'text-muted-foreground'}`}>Tables</span>
                            <span className={`text-2xl font-mono ${isDetailed ? 'text-amber-500' : ''}`}>14</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border
                            ${isDetailed
                                ? 'border-[#3a3b45] text-slate-300 hover:bg-[#2a2b35]'
                                : 'border-border hover:bg-secondary'}
                         `}>
                            Clear Cache
                        </button>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border
                            ${isDetailed
                                ? 'border-[#3a3b45] text-slate-300 hover:bg-[#2a2b35]'
                                : 'border-border hover:bg-secondary'}
                         `}>
                            Export JSON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
