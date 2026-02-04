import React, { useState } from 'react';
import GlassPanel from '../common/GlassPanel';
import Button from '../common/Button';

/**
 * MapMarkerEditor Component
 * Right panel component for adding and editing markers on maps
 */
const MapMarkerEditor = ({ markers = [], onAddMarker, onUpdateMarker, onDeleteMarker, onClose }) => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Marker types with icons and colors
    const markerTypes = [
        { id: 'city', label: 'City', icon: 'location_city', color: 'blue' },
        { id: 'dungeon', label: 'Dungeon', icon: 'castle', color: 'red' },
        { id: 'landmark', label: 'Landmark', icon: 'place', color: 'green' },
        { id: 'battle', label: 'Battle Site', icon: 'swords', color: 'orange' },
        { id: 'default', label: 'Location', icon: 'location_on', color: 'purple' },
    ];

    const filteredMarkers = markers.filter(m =>
        m.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-surface-dark border-l border-white/10">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        Map Markers
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search markers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Marker List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredMarkers.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <span className="material-symbols-outlined text-4xl opacity-20 mb-2">location_off</span>
                        <p className="text-sm">No markers yet</p>
                        <p className="text-xs mt-1">Click on the map to add markers</p>
                    </div>
                ) : (
                    filteredMarkers.map((marker, index) => (
                        <GlassPanel
                            key={marker.id || index}
                            className={`p-4 cursor-pointer transition-all ${selectedMarker?.id === marker.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/5 hover:border-white/20'
                                }`}
                            onClick={() => setSelectedMarker(marker)}
                        >
                            <div className="flex items-start gap-3">
                                {/* Marker Icon */}
                                <div className={`size-10 rounded-xl flex items-center justify-center bg-${marker.type || 'primary'}/10 border border-${marker.type || 'primary'}/20`}>
                                    <span className="material-symbols-outlined text-lg text-primary">
                                        {markerTypes.find(t => t.id === marker.type)?.icon || 'location_on'}
                                    </span>
                                </div>

                                {/* Marker Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white truncate">{marker.label || 'Unnamed'}</h3>
                                    <p className="text-xs text-slate-500 truncate">{marker.description || 'No description'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-slate-600">
                                            {marker.type || 'location'}
                                        </span>
                                        {marker.entityId && (
                                            <span className="text-[10px] text-primary">• Linked</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteMarker(marker.id);
                                        }}
                                        className="size-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xs">delete</span>
                                    </button>
                                </div>
                            </div>
                        </GlassPanel>
                    ))
                )}
            </div>

            {/* Footer - Add Marker Button */}
            <div className="p-6 border-t border-white/10">
                <Button
                    variant="primary"
                    icon="add_location"
                    className="w-full py-3 rounded-xl"
                    onClick={() => {
                        setIsAdding(true);
                        if (onAddMarker) onAddMarker();
                    }}
                >
                    Add Marker
                </Button>
                <p className="text-xs text-slate-500 text-center mt-3">
                    Click on the map to place a new marker
                </p>
            </div>

            {/* Marker Type Selector (shown when adding) */}
            {isAdding && (
                <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Select Marker Type</h3>
                            <p className="text-sm text-slate-400">Choose the type of location</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {markerTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setIsAdding(false);
                                        // Trigger marker placement with this type
                                    }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors mb-2">
                                        {type.icon}
                                    </span>
                                    <p className="text-sm font-bold text-white">{type.label}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsAdding(false)}
                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapMarkerEditor;
