'use client';

import { useState } from 'react';
import { useCosmosStore, SpacetimeInfo } from '@/lib/stores/useCosmosStore';
import { DEFAULT_TIME_CONFIG } from '@/lib/chrono/chrono-engine';

interface CreateWhatIfModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateWhatIfModal({ isOpen, onClose }: CreateWhatIfModalProps) {
    const { spacetimes, addSpacetime, setSpacetime, currentTick } = useCosmosStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [divergeFrom, setDivergeFrom] = useState<string>('canon');
    const [divergeTick, setDivergeTick] = useState<number>(currentTick);

    if (!isOpen) return null;

    const handleCreate = () => {
        if (!name.trim()) return;

        const newSpacetime: SpacetimeInfo = {
            id: `st-${Date.now()}`,
            name: name.trim(),
            isCanon: false,
            timeConfig: {
                ...DEFAULT_TIME_CONFIG,
                epoch_name: name.trim(),
            },
        };

        addSpacetime(newSpacetime);
        setSpacetime(newSpacetime.id);

        // Reset form
        setName('');
        setDescription('');
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Create What-If</h2>
                        <p className="text-sm text-muted-foreground">Fork a new alternate timeline</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">What-If Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., 'Arthur Dies Young', 'No Magic'"
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the divergence point..."
                            rows={2}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    {/* Diverge From */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Diverge From</label>
                        <select
                            value={divergeFrom}
                            onChange={(e) => setDivergeFrom(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {spacetimes.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.isCanon ? '🔵' : '🟣'} {st.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Diverge At Tick */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Divergence Point (Tick: {divergeTick.toLocaleString()})
                        </label>
                        <input
                            type="range"
                            min="0"
                            max={1000000}
                            value={divergeTick}
                            onChange={(e) => setDivergeTick(Number(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            State before this tick will be inherited from "{spacetimes.find(s => s.id === divergeFrom)?.name}"
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                            <p className="text-xs text-purple-300">
                                This creates a parallel reality. Changes in this What-If won't affect the original timeline.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create What-If
                    </button>
                </div>
            </div>
        </div>
    );
}
