import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../../components/common/GlassPanel';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import MapLibreView from '../components/MapLibreView';
import MapMarkerEditor from '../components/MapMarkerEditor';
import { entityService } from '../../../database/entityService';
import { Entidad } from '../../../database/types';

import { MapMarker, MapLayer, MapConnection, MapAttributes } from '../../../types/maps';

interface ArchitectContext {
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightOpen: (isOpen: boolean) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
  setRightPanelTab: (tab: string) => void;
}

const InteractiveMapView: React.FC<{ map: Entidad }> = ({ map }) => {
 const { t } = useLanguage();
 const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
 const { setRightPanelContent, setRightOpen, setRightPanelTitle, setRightPanelTab } = useOutletContext<ArchitectContext>();

 const mapName = map?.nombre || t('maps.explorer');

  // Tool Modes: 'explore', 'add_layer', 'add_connection', 'add_marker'
  const [interactionMode, setInteractionMode] = useState('explore');
  const [connectionSource, setConnectionSource] = useState<MapMarker | null>(null);
  const [newLayerUrl, setNewLayerUrl] = useState('');
  const [newLayerName, setNewLayerName] = useState('');
  const [localMap, setLocalMap] = useState<Entidad>(map);

  const [isEditingMarker, setIsEditingMarker] = useState(false);
  const [editMarkerData, setEditMarkerData] = useState<Partial<MapMarker>>({});
  const [availableEntities, setAvailableEntities] = useState<Entidad[]>([]);

  useEffect(() => {
    entityService.getAllByProject(map.project_id).then(entities => {
      setAvailableEntities(entities.filter(e => e.tipo !== 'Map' && e.tipo !== 'Mapa'));
    });
  }, [map.project_id]);


 // Sync local map when prop changes (if edited outside)
 useEffect(() => {
 setLocalMap(map);
 }, [map]);

 // Resolve Map Image: attributes.bgImage -> attributes.snapshotUrl -> iconUrl -> fallback
 const mapAttributes = typeof localMap?.contenido_json === 'string' 
 ? JSON.parse(localMap.contenido_json) 
 : (localMap?.contenido_json || {});

 let mapImage = mapAttributes.bgImage || mapAttributes.snapshotUrl || null;
 
 // Safety check for invalid or placeholder URLs
 if (mapImage && (
 mapImage.toLowerCase().includes('duckdns') || 
 mapImage.toLowerCase().includes('nopreview') ||
 mapImage === 'placeholder-map.png'
 )) {
 mapImage = null;
 }

 // Get markers, layers and connections from attributes
 const markers = mapAttributes.markers || [];
 const layers = mapAttributes.layers || [];
 const connections = mapAttributes.connections || [];

 // Get image dimensions (default to 1920x1080 if not specified)
 const imageWidth = mapAttributes.imageWidth || 1920;
 const imageHeight = mapAttributes.imageHeight || 1080;

 // Persist changes to map entity
 const saveMapAttributes = async (newAttributes: MapAttributes) => {
 if (!localMap) return;
 try {
 const updatedMap = {
 ...localMap,
 contenido_json: JSON.stringify(newAttributes)
 };
 await entityService.update(localMap.id, updatedMap);
 setLocalMap(updatedMap);
 window.dispatchEvent(new CustomEvent('map-updated'));
 } catch (err) {
 console.error("Error saving map attributes", err);
 alert("No se pudieron guardar los cambios en el mapa.");
 }
 };

 const handleAddLayer = () => {
 if (!newLayerUrl) return;
 const newLayer = {
 name: newLayerName || `Capa ${layers.length + 1}`,
 url: newLayerUrl,
 defaultVisible: true,
 opacity: 1
 };
 const updatedAttrs = { ...mapAttributes, layers: [...layers, newLayer] };
 saveMapAttributes(updatedAttrs);
 setNewLayerUrl('');
 setNewLayerName('');
 setInteractionMode('explore');
 };

 const handleDeleteLayer = (index: number) => {
 const newLayers = [...layers];
 newLayers.splice(index, 1);
 saveMapAttributes({ ...mapAttributes, layers: newLayers });
 };

 const handleDeleteConnection = (index: number) => {
 const newConnections = [...connections];
 newConnections.splice(index, 1);
 saveMapAttributes({ ...mapAttributes, connections: newConnections });
 };

 const handleDeleteMarker = (id: string) => {
   const updatedMarkers = markers.filter((m: MapMarker) => m.id !== id);
   const updatedConns = connections.filter((c: MapConnection) => c.sourceId !== id && c.targetId !== id);
   saveMapAttributes({ ...mapAttributes, markers: updatedMarkers, connections: updatedConns });
 };

 // Push content to global panel whenever selectedMarker changes
 useEffect(() => {
 if (setRightPanelTab) setRightPanelTab('CONTEXTO'); 
 setRightPanelTitle(
 <div className="flex flex-col">
 <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Explorador de Atlas</span>
 <span className="text-foreground font-serif font-black text-lg truncate">{mapName}</span>
 </div>
 );

 if (selectedMarker) {
 setRightPanelContent(
 <div className="flex flex-col h-full gap-8 p-6 animate-in slide-in-from-right-4 duration-300 custom-scrollbar overflow-y-auto">
 <header className="space-y-6">
 <div className="relative aspect-[4/3] rounded-none overflow-hidden border border-foreground/40 shadow-xl group">
 <img src="https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&w=500&q=80" alt="Detail" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
  <div className="absolute top-4 right-4 flex gap-2">
    {!isEditingMarker && (
      <button onClick={() => { setIsEditingMarker(true); setEditMarkerData(selectedMarker); }} className="size-8 rounded-none monolithic-panel text-foreground flex items-center justify-center hover:bg-background/60 transition-colors">
        <span className="material-symbols-outlined text-sm">edit</span>
      </button>
    )}
    <button onClick={() => { setSelectedMarker(null); setIsEditingMarker(false); }} className="size-8 rounded-none monolithic-panel text-foreground flex items-center justify-center hover:bg-background/60 transition-colors">
      <span className="material-symbols-outlined text-sm">close</span>
    </button>
  </div>

 <div className="absolute bottom-4 left-4 flex gap-2">
 <span className="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest ">{t('maps.place')}</span>
 </div>
 </div>
  {isEditingMarker ? (
    <div className="mt-4 space-y-4">
      <input 
        type="text" 
        value={editMarkerData.label || ''} 
        onChange={e => setEditMarkerData({...editMarkerData, label: e.target.value})}
        className="w-full monolithic-panel rounded-none px-4 py-2 text-sm text-foreground focus:border-primary outline-none" 
        placeholder="Nombre del Lugar"
      />
      <textarea 
        value={editMarkerData.description || ''} 
        onChange={e => setEditMarkerData({...editMarkerData, description: e.target.value})}
        className="w-full monolithic-panel rounded-none p-4 text-sm text-foreground focus:border-primary outline-none h-24 resize-none" 
        placeholder="Descripción"
      />
      <select 
        value={editMarkerData.entityId?.toString() || ''}
        onChange={e => setEditMarkerData({...editMarkerData, entityId: e.target.value ? Number(e.target.value) : undefined})}
        className="w-full monolithic-panel rounded-none px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none"
      >
        <option value="">-- Sin Vincular a Entidad --</option>
        {availableEntities.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.tipo})</option>)}
      </select>
      <div className="flex gap-2">
        <Button variant="primary" className="flex-1 justify-center py-2" onClick={() => {
          const updatedMarkers = markers.map((m: MapMarker) => m.id === selectedMarker.id ? { ...m, ...editMarkerData } as MapMarker : m);
          if (!markers.find((m: MapMarker) => m.id === selectedMarker.id)) updatedMarkers.push(editMarkerData as MapMarker);
          saveMapAttributes({ ...mapAttributes, markers: updatedMarkers });
          setSelectedMarker(editMarkerData as MapMarker);
          setIsEditingMarker(false);
        }}>Guardar</Button>
        <button onClick={() => {
          if (!selectedMarker.label && !selectedMarker.description) {
            setSelectedMarker(null); // was a new marker
          }
          setIsEditingMarker(false);
        }} className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground">Cancelar</button>
      </div>
    </div>
  ) : (
    <div className="mt-4">
      <h2 className="text-2xl font-black text-foreground leading-tight mb-2">{selectedMarker.label || 'Ubicación Desconocida'}</h2>
      <p className="text-foreground/60 font-medium text-xs leading-relaxed">{selectedMarker.description || 'Sin descripción disponible.'}</p>
      {selectedMarker.entityId && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-primary/10 border border-primary/20 text-xs font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined text-sm">link</span>
          Ver Entidad Vinculada
        </div>
      )}
    </div>
  )}

 </header>

 <div className="space-y-8">
 <section className="space-y-4">
 <div className="flex justify-between items-center px-1">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">{t('maps.inhabitants')}</h3>
 </div>
 <div className="space-y-3">
 <InhabitantRow name="Personaje A" role="Rol A" />
 </div>
 </section>

 <section className="space-y-4 pt-6 border-t border-foreground/10">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Herramientas</h3>
 <div className="grid grid-cols-1 gap-2">
 <button
 onClick={() => { setSelectedMarker(null); setInteractionMode('add_layer'); }}
 className="flex items-center gap-3 p-3 rounded-none bg-white/[0.03] border border-foreground/10 text-[10px] font-black uppercase text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-all"
 >
 <span className="material-symbols-outlined text-sm text-primary">layers</span>
 Gestionar Multicapas
 </button>
 <button
 onClick={() => { setSelectedMarker(null); setInteractionMode('add_connection'); setConnectionSource(null); }}
 className="flex items-center gap-3 p-3 rounded-none bg-white/[0.03] border border-foreground/10 text-[10px] font-black uppercase text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-all"
 >
 <span className="material-symbols-outlined text-sm text-primary">settings_ethernet</span>
 Relaciones N:M
 </button>
 </div>
 </section>
 </div>
 </div>
 );
 setRightOpen(true);
 } else {
 if (interactionMode === 'add_layer') {
 setRightPanelContent(
 <div className="p-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
 <div className="flex items-center gap-3 mb-6">
 <button onClick={() => setInteractionMode('explore')} className="size-8 rounded-none monolithic-panel flex items-center justify-center hover:bg-foreground/10 text-foreground transition-colors">
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 </button>
 <h3 className="text-foreground font-serif font-black text-xl">Multicapas</h3>
 </div>

 <div className="space-y-6 flex-1">
 <div className="space-y-4 bg-white/[0.02] p-4 rounded-none border border-foreground/10">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Nueva Capa</h4>
 <div>
 <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-2">URL de la Imagen (Opcional Transparente)</label>
 <input
 type="text"
 value={newLayerUrl}
 onChange={(e) => setNewLayerUrl(e.target.value)}
 placeholder="https://ejemplo.com/mapa-ruinas.png"
 className="w-full monolithic-panel rounded-none px-4 py-3 text-sm text-foreground focus:border-primary outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-2">Nombre de Capa</label>
 <input
 type="text"
 value={newLayerName}
 onChange={(e) => setNewLayerName(e.target.value)}
 placeholder="Ej: Catacumbas, Rutas Marítimas..."
 className="w-full monolithic-panel rounded-none px-4 py-3 text-sm text-foreground focus:border-primary outline-none"
 />
 </div>
 <Button
 variant="primary"
 className="w-full justify-center"
 onClick={handleAddLayer}
 disabled={!newLayerUrl}
 >
 Agregar Capa
 </Button>
 </div>

 <div className="space-y-3">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Capas Activas</h4>
 {layers.length === 0 && <p className="text-xs text-foreground/60 italic">No hay capas adicionales. Solo el mapa base.</p>}
 {layers.map((l: MapLayer, idx: number) => (
 <div key={idx} className="flex items-center justify-between p-3 rounded-none bg-white/[0.02] border border-foreground/10">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary text-sm opacity-50">layers</span>
 <span className="text-xs font-bold text-foreground">{l.name}</span>
 </div>
 <button onClick={() => handleDeleteLayer(idx)} className="text-red-400 hover:text-red-300 p-1">
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
 } else if (interactionMode === 'add_connection') {
 setRightPanelContent(
 <div className="p-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
 <div className="flex items-center gap-3 mb-6">
 <button onClick={() => { setInteractionMode('explore'); setConnectionSource(null); }} className="size-8 rounded-none monolithic-panel flex items-center justify-center hover:bg-foreground/10 text-foreground transition-colors">
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 </button>
 <h3 className="text-foreground font-serif font-black text-xl">Rutas y Relaciones</h3>
 </div>

 <div className={`p-4 rounded-none border-2 border-dashed ${connectionSource ? 'border-primary/50 bg-primary/5 text-primary' : 'border-foreground/40 bg-white/[0.02] text-foreground/60'} text-center mb-6`}>
 <span className="material-symbols-outlined text-3xl mb-2">{connectionSource ? 'route' : 'touch_app'}</span>
 <p className="text-xs font-medium">
 {connectionSource ? 'Selecciona el marcador de Destino en el mapa' : 'Haz clic en un marcador para establecer el Origen'}
 </p>
 {connectionSource && (
 <div className="mt-3 p-2 bg-background/40 rounded-none text-foreground font-bold text-[10px] uppercase tracking-wider shadow-inner">
 Origen: {connectionSource.label}
 </div>
 )}
 </div>

 <div className="space-y-3 flex-1 overflow-y-auto">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Rutas Existentes</h4>
 {connections.length === 0 && <p className="text-xs text-foreground/60 italic">No hay rutas conectadas.</p>}
 {connections.map((c: MapConnection, idx: number) => {
 const s = markers.find((m: MapMarker) => m.id === c.sourceId);
 const t = markers.find((m: MapMarker) => m.id === c.targetId);
 return (
 <div key={idx} className="flex items-center justify-between p-3 rounded-none bg-white/[0.02] border border-foreground/10 group">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-bold text-foreground truncate">{s?.label || '???'}</span>
 <span className="material-symbols-outlined text-[10px] text-foreground/60">arrow_forward</span>
 <span className="text-[10px] font-bold text-foreground truncate">{t?.label || '???'}</span>
 </div>
 <span className="text-[9px] font-medium text-primary uppercase tracking-widest">{c.label}</span>
 </div>
 <button onClick={() => handleDeleteConnection(idx)} className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>
 );
 })}
 </div>
 </div>
 );
 } else if (interactionMode === 'manage_markers') {
    setRightPanelContent(
      <MapMarkerEditor 
        markers={markers}
        onDeleteMarker={handleDeleteMarker}
        onSelectMarker={handleMarkerClick}
        onAddMarker={() => setInteractionMode('add_marker')}
        onClose={() => setInteractionMode('explore')}
      />
    );
  } else {
    setRightPanelContent(
      <div className="p-6 text-foreground/60 text-center flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
        <div className="size-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
          <span className="material-symbols-outlined text-4xl text-primary opacity-40">
            {interactionMode === 'add_marker' ? 'add_location' : 'explore'}
          </span>
        </div>
        <h3 className="text-foreground font-serif font-black mb-2 text-xl">
          {interactionMode === 'add_marker' ? 'Modo: Añadir Marcador' : mapName}
        </h3>
        <p className="text-xs max-w-[200px] leading-relaxed opacity-60">
          {interactionMode === 'add_marker' ? 'Haz clic en cualquier punto del mapa para colocar un nuevo marcador.' : 'Navega por el mapa e interactúa con los puntos de interés para ver detalles específicos.'}
        </p>

        {interactionMode === 'add_marker' && (
          <button onClick={() => setInteractionMode('explore')} className="mt-6 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground text-xs font-bold transition-colors">
            Cancelar Operación
          </button>
        )}

        <div className="mt-12 w-full space-y-4 border-t border-foreground/10 pt-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 text-left px-2 mb-4">Herramientas Globales</h3>

          <button onClick={() => setInteractionMode('manage_markers')} className="w-full p-4 rounded-none bg-white/[0.02] border border-foreground/10 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
            <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined">list_alt</span>
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">Gestionar Marcadores</span>
              <span className="block text-[9px] text-foreground/60 font-medium normal-case tracking-normal">Lista y edición de ubicaciones</span>
            </div>
          </button>
          <button onClick={() => setInteractionMode('add_marker')} className="w-full p-4 rounded-none bg-white/[0.02] border border-foreground/10 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
            <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined">add_location</span>
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">Añadir Marcador</span>
              <span className="block text-[9px] text-foreground/60 font-medium normal-case tracking-normal">Crear punto de interés</span>
            </div>
          </button>
          <button onClick={() => setInteractionMode('add_layer')} className="w-full p-4 rounded-none bg-white/[0.02] border border-foreground/10 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
            <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined">layers</span>
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">Gestionar Multicapas</span>
              <span className="block text-[9px] text-foreground/60 font-medium normal-case tracking-normal">Control de elevación y estratos</span>
            </div>
          </button>
          <button onClick={() => setInteractionMode('add_connection')} className="w-full p-4 rounded-none bg-white/[0.02] border border-foreground/10 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
            <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined">settings_ethernet</span>
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">Relaciones N:M</span>
              <span className="block text-[9px] text-foreground/60 font-medium normal-case tracking-normal">Conectar territorios y zonas</span>
            </div>
          </button>
        </div>
      </div>
    );
  }
}
}, [selectedMarker, localMap, interactionMode, newLayerUrl, newLayerName, connectionSource, isEditingMarker, editMarkerData, availableEntities]);

 // Cleanup on unmount
 useEffect(() => {
 return () => {
 setRightPanelContent(null);
 setRightPanelTitle(null);
 setRightOpen(false);
 };
 }, []);

  const handleMarkerClick = (marker: MapMarker) => {
    if (interactionMode === 'add_connection') {
      if (!connectionSource) {
        setConnectionSource(marker);
      } else {
        if (connectionSource.id !== marker.id) {
          const label = prompt("Nombre de la ruta/relación (Opcional):", "Camino");
          if (label !== null) {
            const newConn = {
              sourceId: connectionSource.id,
              targetId: marker.id,
              label: label,
              color: '#6366f1',
              weight: 3,
              dashed: false
            };
            saveMapAttributes({ ...mapAttributes, connections: [...connections, newConn] });
          }
        }
        setConnectionSource(null);
      }
    } else {
      setSelectedMarker(marker);
      setIsEditingMarker(false);
      setRightOpen(true);
      setInteractionMode('explore');
    }
  };

  const handleMapClick = (lng: number, lat: number) => {
    if (interactionMode === 'add_marker') {
      const newMarker: Partial<MapMarker> = {
        id: crypto.randomUUID(),
        lng,
        lat,
        label: '',
        description: '',
      };
      // We don't save immediately, we open it in edit mode
      setSelectedMarker(newMarker as MapMarker);
      setEditMarkerData(newMarker);
      setIsEditingMarker(true);
      setRightOpen(true);
      setInteractionMode('explore'); // revert to explore mode so another click doesn't add another instantly unless requested
    }
  };


 return (
 <div className="flex-1 flex overflow-hidden bg-background font-sans text-foreground/60 relative">
 <main className="flex-1 overflow-hidden relative group z-0">
 <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden border border-foreground/10 shadow-2xl monolithic-panel">
 {mapImage ? (
 <MapLibreView
 mapImage={mapImage}
 markers={markers}
 layers={layers}
              connections={connections}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick}
              imageWidth={imageWidth}
 imageHeight={imageHeight}
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-foreground/60">
 <div className="text-center space-y-4">
 <span className="material-symbols-outlined text-6xl opacity-20">map</span>
 <p>{t('maps.not_found')}</p>
 <p className="text-xs text-foreground/60">{t('maps.upload_desc')}</p>
 </div>
 </div>
 )}
 </div>
 </main>
 </div>
 );
};

const InhabitantRow: React.FC<{ name: string; role: string }> = ({ name, role }) => (
 <div className="flex items-center gap-4 p-3 rounded-none bg-white/[0.02] border border-foreground/10 hover:border-foreground/40 transition-all cursor-pointer group">
 <Avatar name={name} size="sm" className="border-foreground/40 group-hover:border-primary/50 transition-all" />
 <div className="flex-1 min-w-0">
 <h4 className="text-xs font-bold text-foreground truncate">{name}</h4>
 <p className="text-[10px] text-foreground/60 font-medium truncate">{role}</p>
 </div>
 <span className="material-symbols-outlined text-foreground/60 text-sm group-hover:text-foreground transition-colors">chevron_right</span>
 </div>
);

export default InteractiveMapView;
