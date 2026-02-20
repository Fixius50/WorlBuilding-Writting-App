import React, { useMemo } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap, LayersControl, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../css/leaflet-custom.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/assets/leaflet/images/marker-icon-2x.png',
    iconUrl: '/assets/leaflet/images/marker-icon.png',
    shadowUrl: '/assets/leaflet/images/marker-shadow.png',
});

/**
 * Custom Marker Icon Creator
 * Creates styled marker icons based on entity type
 */
const createCustomIcon = (type = 'default') => {
    const iconHtml = `
        <div class="custom-marker-icon marker-${type}">
            <span class="material-symbols-outlined" style="font-size: 18px; color: white;">
                ${getIconForType(type)}
            </span>
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const getIconForType = (type) => {
    const icons = {
        city: 'location_city',
        dungeon: 'castle',
        landmark: 'place',
        battle: 'swords',
        default: 'location_on'
    };
    return icons[type] || icons.default;
};

/**
 * Component to fit map bounds after image loads
 */
const FitBounds = ({ bounds }) => {
    const map = useMap();
    React.useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    }, [map, bounds]);
    return null;
};

/**
 * LeafletMapView Component
 * Renders an interactive map using React Leaflet with custom image overlay
 * and markers for worldbuilding purposes
 */
const LeafletMapView = ({ mapImage, markers = [], layers = [], connections = [], onMarkerClick, onMapClick, imageWidth = 1920, imageHeight = 1080 }) => {
    // Calculate bounds for the custom coordinate system
    // Using CRS.Simple for non-geographical maps
    const bounds = useMemo(() => {
        return [[0, 0], [imageHeight, imageWidth]];
    }, [imageWidth, imageHeight]);

    const center = useMemo(() => {
        return [imageHeight / 2, imageWidth / 2];
    }, [imageWidth, imageHeight]);

    // Default markers for demo if none provided
    const displayMarkers = markers.length > 0 ? markers : [];

    return (
        <div className="w-full h-full relative" style={{ cursor: onMapClick ? 'crosshair' : 'default' }}>
            <MapContainer
                center={center}
                zoom={0}
                minZoom={-2}
                maxZoom={3}
                crs={L.CRS.Simple}
                style={{ height: '100%', width: '100%', background: '#0a0a0c' }}
                zoomControl={true}
                attributionControl={false}
            >
                {/* Layers Control: Base Map and Overlays */}
                <LayersControl position="topright">
                    {/* Base Image Overlay - The custom map image */}
                    {mapImage && (
                        <LayersControl.BaseLayer checked name="Superficie / Base">
                            <ImageOverlay
                                url={mapImage}
                                bounds={bounds}
                                opacity={1}
                                interactive={!!onMapClick}
                                eventHandlers={{
                                    click: (e) => onMapClick && onMapClick(e.latlng)
                                }}
                            />
                        </LayersControl.BaseLayer>
                    )}

                    {/* Additional User-Defined Layers (Subterranean, Ruin maps etc.) */}
                    {layers.map((layer, idx) => (
                        layer.url && !layer.url.toLowerCase().includes('duckdns') && !layer.url.toLowerCase().includes('nopreview') && (
                            <LayersControl.Overlay key={idx} checked={layer.defaultVisible} name={layer.name || `Capa ${idx + 1}`}>
                                <ImageOverlay
                                    url={layer.url}
                                    bounds={bounds}
                                    opacity={layer.opacity || 1}
                                    interactive={!!onMapClick}
                                    eventHandlers={{
                                        click: (e) => onMapClick && onMapClick(e.latlng)
                                    }}
                                />
                            </LayersControl.Overlay>
                        )
                    ))}
                </LayersControl>

                {/* Fit bounds after mount */}
                <FitBounds bounds={bounds} />

                {/* Render Markers */}
                {displayMarkers.map((marker, index) => {
                    // Convert pixel coordinates to Leaflet coordinates
                    // Assuming marker.position is [x, y] in pixels
                    const position = marker.position || [imageHeight / 2, imageWidth / 2];

                    return (
                        <Marker
                            key={marker.id || index}
                            position={position}
                            icon={createCustomIcon(marker.type)}
                            eventHandlers={{
                                click: () => {
                                    if (onMarkerClick) {
                                        onMarkerClick(marker);
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div className="space-y-2">
                                    <h3 className="text-white font-bold">{marker.label || 'Unnamed Location'}</h3>
                                    {marker.description && (
                                        <p className="text-slate-400 text-sm">{marker.description}</p>
                                    )}
                                    {marker.entityId && (
                                        <a
                                            href={`#/entity/${marker.entityId}`}
                                            className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            Ver Detalles
                                        </a>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Render Relationships N:M (Polylines) */}
                {connections.map((conn, idx) => {
                    const sourceMarker = displayMarkers.find(m => m.id === conn.sourceId);
                    const targetMarker = displayMarkers.find(m => m.id === conn.targetId);

                    if (sourceMarker && targetMarker) {
                        const sourcePos = sourceMarker.position || [imageHeight / 2, imageWidth / 2];
                        const targetPos = targetMarker.position || [imageHeight / 2, imageWidth / 2];

                        return (
                            <Polyline
                                key={`conn-${idx}`}
                                positions={[sourcePos, targetPos]}
                                pathOptions={{
                                    color: conn.color || '#6366f1',
                                    weight: conn.weight || 3,
                                    opacity: 0.8,
                                    dashArray: conn.dashed ? '10, 10' : null
                                }}
                            >
                                {conn.label && (
                                    <Tooltip sticky className="bg-surface-dark border-white/10 text-slate-200">
                                        {conn.label}
                                    </Tooltip>
                                )}
                            </Polyline>
                        );
                    }
                    return null;
                })}
            </MapContainer>

            {/* Map Legend (Optional) */}
            {displayMarkers.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-surface-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-w-xs z-[1000]">
                    <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">map</span>
                        Locations ({displayMarkers.length})
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                        {displayMarkers.slice(0, 10).map((marker, index) => (
                            <div
                                key={marker.id || index}
                                className="text-xs text-slate-400 flex items-center gap-2 hover:text-white cursor-pointer transition-colors"
                                onClick={() => onMarkerClick && onMarkerClick(marker)}
                            >
                                <span className={`w-2 h-2 rounded-full bg-primary`}></span>
                                {marker.label || `Location ${index + 1}`}
                            </div>
                        ))}
                        {displayMarkers.length > 10 && (
                            <p className="text-xs text-slate-500 italic">+{displayMarkers.length - 10} more...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeafletMapView;
