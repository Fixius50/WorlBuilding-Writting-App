'use client';

import { useState, useEffect } from 'react';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';
import { CreateWhatIfModal } from '@/components/modals/CreateWhatIfModal';

interface TimeBarProps {
    className?: string;
    minimal?: boolean;
}

// Available tick scales for step size
const TICK_SCALES = [
    { label: '1 min', value: 1 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
    { label: '1 week', value: 10080 },
    { label: '1 month', value: 43200 },
    { label: '1 year', value: 525600 },
];

export function TimeBar({ className = '', minimal = false }: TimeBarProps) {
    const [tickScale, setTickScale] = useState(1440); // Default: 1 day
    const [showWhatIfModal, setShowWhatIfModal] = useState(false);
    const {
        currentTick,
        maxTick,
        isPlaying,
        spacetimes,
        currentSpacetimeId,
        setSpacetime,
        setTick,
        togglePlay,
        stepForward,
        stepBackward,
        getLocalTime,
        getUniversalTime,
        isDivergent,
    } = useCosmosStore();

    // Autoplay effect
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            stepForward(tickScale);
        }, 100); // 10 FPS

        return () => clearInterval(interval);
    }, [isPlaying, tickScale, stepForward]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTick(Number(e.target.value));
    };

    return (
        <>
            <div className={`flex items-center gap-4 px-4 py-2 bg-card/50 border-b border-border ${minimal ? 'border-none bg-transparent p-0' : ''} ${className}`}>
                {/* Spacetime Tabs - Hide in Minimal */}
                {!minimal && (
                    <div className="flex items-center gap-1">
                        {spacetimes.map((st) => (
                            <button
                                key={st.id}
                                onClick={() => setSpacetime(st.id)}
                                className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${currentSpacetimeId === st.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary/50 hover:bg-secondary text-foreground'}
            `}
                            >
                                <span className={`w-2 h-2 rounded-full ${st.isCanon ? 'bg-green-400' : 'bg-purple-400'}`} />
                                {st.name}
                            </button>
                        ))}

                        {/* Add What-If Button */}
                        <button
                            onClick={() => setShowWhatIfModal(true)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                            title="Create What-If"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Divergence Indicator */}
                {isDivergent() && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Divergent</span>
                    </div>
                )}

                {/* Time Display */}
                <div className="flex-1 flex items-center gap-4">
                    {/* Universal Time */}
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Universal</span>
                        <span className="text-sm font-mono font-medium">{getUniversalTime()}</span>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-8 bg-border" />

                    {/* Local Time */}
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Local</span>
                        <span className="text-sm font-mono font-medium">{getLocalTime()}</span>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTick(0)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Go to Beginning"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="5" width="3" height="14" />
                            <polygon points="21 5 9 12 21 19 21 5" />
                        </svg>
                    </button>

                    <button
                        onClick={() => stepBackward(tickScale)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title={`Step Back (${TICK_SCALES.find(s => s.value === tickScale)?.label})`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="19 5 9 12 19 19 19 5" />
                            <polygon points="11 5 1 12 11 19 11 5" />
                        </svg>
                    </button>

                    <button
                        onClick={togglePlay}
                        className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        title={isPlaying ? 'Pause' : 'Play'}
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

                    <button
                        onClick={() => stepForward(tickScale)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title={`Step Forward (${TICK_SCALES.find(s => s.value === tickScale)?.label})`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 5 15 12 5 19 5 5" />
                            <polygon points="13 5 23 12 13 19 13 5" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setTick(maxTick)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Go to End"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="3 5 15 12 3 19 3 5" />
                            <rect x="17" y="5" width="3" height="14" />
                        </svg>
                    </button>
                </div>

                {/* Time Slider */}
                <div className="w-48 flex items-center gap-2">
                    <input
                        type="range"
                        min="0"
                        max={maxTick}
                        value={currentTick}
                        onChange={handleSliderChange}
                        className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        style={{
                            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTick / maxTick) * 100}%, hsl(var(--secondary)) ${(currentTick / maxTick) * 100}%, hsl(var(--secondary)) 100%)`
                        }}
                    />
                </div>

                {/* Scale Selector */}
                <select
                    value={tickScale}
                    onChange={(e) => setTickScale(Number(e.target.value))}
                    className="px-2 py-1 text-xs bg-secondary border border-border rounded-md text-foreground"
                    title="Tick Scale"
                >
                    {TICK_SCALES.map((scale) => (
                        <option key={scale.value} value={scale.value}>
                            {scale.label}
                        </option>
                    ))}
                </select>
            </div>
            <CreateWhatIfModal isOpen={showWhatIfModal} onClose={() => setShowWhatIfModal(false)} />
        </>
    );
}
