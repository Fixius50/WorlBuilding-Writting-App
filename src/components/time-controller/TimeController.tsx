'use client';

import { useState } from 'react';

interface TimeControllerProps {
    className?: string;
}

interface Timeline {
    id: string;
    name: string;
    type: 'canon' | 'divergent' | 'whatif';
    parentId?: string;
}

// Mock timelines (will be replaced with SQLite queries)
const mockTimelines: Timeline[] = [
    { id: '1', name: 'Canon', type: 'canon' },
    { id: '2', name: 'What If: The Hero Dies', type: 'whatif', parentId: '1' },
    { id: '3', name: 'Alternate Timeline', type: 'divergent', parentId: '1' },
];

export function TimeController({ className = '' }: TimeControllerProps) {
    const [activeTimeline, setActiveTimeline] = useState<Timeline>(mockTimelines[0]);
    const [gameTick, setGameTick] = useState(0);
    const [maxTick] = useState(1000);
    const [isPlaying, setIsPlaying] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const getTimelineColor = (type: Timeline['type']) => {
        switch (type) {
            case 'canon': return 'bg-green-500';
            case 'divergent': return 'bg-amber-500';
            case 'whatif': return 'bg-purple-500';
        }
    };

    const formatTick = (tick: number) => {
        // Convert game tick to a readable format (e.g., Year 1, Day 123)
        const year = Math.floor(tick / 365) + 1;
        const day = (tick % 365) + 1;
        return `Year ${year}, Day ${day}`;
    };

    return (
        <div className={`flex items-center gap-4 px-4 py-2 bg-card/50 border-b border-border ${className}`}>
            {/* Timeline Selector */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors min-w-[200px]"
                >
                    <span className={`w-2.5 h-2.5 rounded-full ${getTimelineColor(activeTimeline.type)}`} />
                    <span className="text-sm font-medium">{activeTimeline.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                        {mockTimelines.map((timeline) => (
                            <button
                                key={timeline.id}
                                onClick={() => {
                                    setActiveTimeline(timeline);
                                    setDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors ${activeTimeline.id === timeline.id ? 'bg-secondary/50' : ''
                                    }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full ${getTimelineColor(timeline.type)}`} />
                                <span className="text-sm">{timeline.name}</span>
                                {timeline.parentId && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        branch
                                    </span>
                                )}
                            </button>
                        ))}
                        <div className="border-t border-border">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span className="text-sm">New Timeline</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Divergence Indicator */}
            {activeTimeline.type !== 'canon' && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs text-cyan-400 font-medium">DIVERGENT</span>
                </div>
            )}

            {/* Time Slider */}
            <div className="flex-1 flex items-center gap-3">
                {/* Play/Pause */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                {/* Current Time Display */}
                <div className="text-sm font-mono text-muted-foreground min-w-[140px]">
                    {formatTick(gameTick)}
                </div>

                {/* Slider */}
                <input
                    type="range"
                    min="0"
                    max={maxTick}
                    value={gameTick}
                    onChange={(e) => setGameTick(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(gameTick / maxTick) * 100}%, hsl(var(--secondary)) ${(gameTick / maxTick) * 100}%, hsl(var(--secondary)) 100%)`
                    }}
                />

                {/* Tick Display */}
                <div className="text-xs font-mono text-muted-foreground">
                    Tick: {gameTick}
                </div>
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setGameTick(0)}
                    className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary rounded transition-colors"
                    title="Go to Beginning"
                >
                    ⏮
                </button>
                <button
                    onClick={() => setGameTick(Math.max(0, gameTick - 10))}
                    className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary rounded transition-colors"
                    title="Back 10 ticks"
                >
                    ◀◀
                </button>
                <button
                    onClick={() => setGameTick(Math.min(maxTick, gameTick + 10))}
                    className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary rounded transition-colors"
                    title="Forward 10 ticks"
                >
                    ▶▶
                </button>
                <button
                    onClick={() => setGameTick(maxTick)}
                    className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary rounded transition-colors"
                    title="Go to End"
                >
                    ⏭
                </button>
            </div>
        </div>
    );
}
