import { useState } from 'react';
import { MapMarker } from '@domain/models/maps';

/**
 * 🧠 useMapMarkerEditor
 * Logic for managing map markers, including searching, adding, and selecting.
 */
export const useMapMarkerEditor = (
  markers: MapMarker[],
  onAddMarker?: (type?: string) => void
) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
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

  const handleStartAdding = () => {
    setIsAdding(true);
    if (onAddMarker) onAddMarker();
  };

  const handleSelectType = (typeId: string) => {
    setIsAdding(false);
    // Trigger marker placement with this type logic could go here or in parent
  };

  return {
    selectedMarkerId, setSelectedMarkerId,
    isAdding, setIsAdding,
    searchTerm, setSearchTerm,
    markerTypes,
    filteredMarkers,
    handleStartAdding,
    handleSelectType
  };
};
