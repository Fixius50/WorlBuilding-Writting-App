import React from 'react';
import MapLibreView from '../components/MapLibreView';
import { useInteractiveMapView } from './useInteractiveMapView';
import { Entidad } from '@domain/database';

const InteractiveMapView: React.FC<{
  map: Entidad;
  onBack?: () => void;
}> = ({ map, onBack }) => {
  const {
    markers,
    layers,
    connections,
    features,
    imageWidth,
    imageHeight,
    mapImage,
    handleMarkerClick,

    // Atlas states and handlers
    levels,
    activeLevelId,
    levelOpacities,
    setLevelOpacities,
    canvasStates,
    levelBgImages,
    eraserCursor,
    handleUploadLevelBgImage,
    annotations,
    backdropOpacity,
    setBackdropOpacity,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    drawTool,
    setDrawTool,

    // UI States and interactions from hook
    zoom,
    pan,
    isPanning,
    spacebarPanning,
    viewMode,
    setViewMode,
    appMode,
    setAppMode,
    activeMenu,
    setActiveMenu,
    hoveredLevelOpacityId,
    setHoveredLevelOpacityId,

    // CRUD Temp States from hook
    editingLevelId,
    setEditingLevelId,
    levelInputText,
    setLevelInputText,
    newLevelName,
    setNewLevelName,
    editingAnnotationId,
    setEditingAnnotationId,
    annotationInputText,
    setAnnotationInputText,
    annotationInputLevelId,
    setAnnotationInputLevelId,
    newAnnotationText,
    setNewAnnotationText,
    newAnnotationLevelId,
    setNewAnnotationLevelId,

    // Canvas Refs & Handlers from hook
    canvasRef,
    handleStartDrawing,
    handleDrawing,
    handleStopDrawing,
    handleTouchStart,
    handleTouchMove,
    handleWheel,
    handleClearCanvas,
    handleTeleport,
    saveAtlasState,
    updateAtlasCache,
    handleBack,
    handleAddLevel,
    handleSaveEditLevel,
    handleDeleteLevel,
    handleAddAnnotation,
    handleSaveEditAnnotation,
    handleDeleteAnnotation,
    activeSidebarTab,
    setActiveSidebarTab,
  } = useInteractiveMapView(map, onBack);

  const [newLevelPosition, setNewLevelPosition] = React.useState<'above' | 'below'>('above');
  const [overlayAllLayers, setOverlayAllLayers] = React.useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-[150] bg-background text-foreground overflow-hidden select-none">

      {/* --- LIENZO PRINCIPAL (96vw x 94vh) --- */}
      <div 
        className="absolute left-[2vw] top-[3vh] w-[96vw] h-[94vh] bg-background border border-foreground/10 overflow-hidden z-0 shadow-2xl"
        onWheel={handleWheel}
      >
        {viewMode === '2D' ? (
          <div 
            className="w-full h-full blueprint-grid flex items-center justify-center relative select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              cursor: spacebarPanning || isPanning ? 'grab' : 'crosshair'
            }}
            onMouseDown={handleStartDrawing}
            onMouseMove={handleDrawing}
            onMouseUp={handleStopDrawing}
            onMouseLeave={handleStopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleStopDrawing}
          >
            {/* Contenedor exacto del mapa (Alinea el calco base con el canvas) */}
            <div 
              className="relative shadow-2xl flex-shrink-0"
              style={{
                width: `${imageWidth}px`,
                height: `${imageHeight}px`
              }}
            >
              {/* Imagen Base / Calco Base de la Capa Activa (Fondo) */}
              <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
                {(levelBgImages[activeLevelId] || mapImage) ? (
                  <img 
                    src={(levelBgImages[activeLevelId] || mapImage)!} 
                    alt="Base" 
                    className="w-full h-full object-fill transition-all duration-300" 
                    style={{ opacity: appMode === 'VIEW' && !overlayAllLayers ? 1.0 : backdropOpacity }} 
                  />
                ) : (
                  <div className="w-full h-full border border-foreground/10 flex items-center justify-center">
                    <svg viewBox="0 0 800 600" className="w-full h-full stroke-foreground/10 fill-none">
                      <path d="M50,50 L750,50 L750,550 L50,550 Z" strokeWidth="1" />
                      <path d="M50,150 L750,150 M50,450 L750,450" />
                      <circle cx="400" cy="300" r="180" strokeDasharray="4,6" />
                      <text x="420" y="280" className="fill-foreground/20 font-serif text-[1.8rem] italic tracking-wider">Sector de Contención</text>
                      <path d="M150,150 L650,450" strokeWidth="0.5" strokeDasharray="1,4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* CAPAS NO ACTIVAS (Fondo de calco en modo EDITAR) */}
              {appMode === 'EDIT' && (
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {levels.slice().reverse().map(lvl => {
                    if (lvl.id === activeLevelId) return null;
                    const savedState = canvasStates[lvl.id];
                    return savedState ? (
                      <img 
                        key={lvl.id}
                        src={savedState} 
                        alt={lvl.name}
                        className="absolute inset-0 w-full h-full object-fill transition-opacity duration-300"
                        style={{ 
                          opacity: levelOpacities[lvl.id] ?? 0.5
                        }}
                      />
                    ) : null;
                  })}
                </div>
              )}

              {/* MODO DIBUJAR: Canvas interactivo único de nivel activo */}
              {appMode === 'EDIT' && (
                <canvas 
                  ref={canvasRef} 
                  width={imageWidth}
                  height={imageHeight}
                  className="absolute inset-0 w-full h-full z-10"
                />
              )}

              {/* Guía visual del borrador (Círculo de cota) */}
              {eraserCursor && drawTool === 'eraser' && appMode === 'EDIT' && (
                <div 
                  className="absolute rounded-full border border-foreground/30 pointer-events-none z-20"
                  style={{
                    left: `${eraserCursor.x}px`,
                    top: `${eraserCursor.y}px`,
                    width: `${brushSize}px`,
                    height: `${brushSize}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
                  }}
                />
              )}

              {/* MODO VISUALIZAR: Superpone todos los niveles según opacidades o muestra solo el activo */}
              {appMode === 'VIEW' && (
                <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {overlayAllLayers ? (
                    levels.slice().reverse().map(lvl => {
                      const savedState = canvasStates[lvl.id];
                      return savedState ? (
                        <img 
                          key={lvl.id}
                          src={savedState} 
                          alt={lvl.name}
                          className="absolute inset-0 w-full h-full object-fill transition-opacity duration-300"
                          style={{ 
                            opacity: levelOpacities[lvl.id] ?? 1.0
                          }}
                        />
                      ) : null;
                    })
                  ) : (
                    (() => {
                      const savedState = canvasStates[activeLevelId];
                      return savedState ? (
                        <img 
                          src={savedState} 
                          alt="Capa Activa"
                          className="absolute inset-0 w-full h-full object-fill"
                        />
                      ) : null;
                    })()
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MODO 3D: Visor de mapas MapLibreView real (sin mocks) */
          <div className="w-full h-full relative z-0">
            {mapImage ? (
              <MapLibreView
                mapImage={mapImage}
                markers={markers}
                layers={layers}
                connections={connections}
                features={features as {
                  type: string;
                  features: Array<{ properties?: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }>;
                } | undefined}
                onMarkerClick={handleMarkerClick}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                is3D={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/40">
                <div className="text-center space-y-2">
                  <span className="material-symbols-outlined text-5xl">cloud_off</span>
                  <div className="text-xs uppercase font-bold tracking-widest">Sin Cartografía Base para 3D</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ESTRUCTURA PANEL LATERAL COLAPSABLE (Estilo VS Code) --- */}
        {appMode === 'EDIT' && (
          <div className="absolute top-[96px] right-[1vw] h-[82vh] z-20 flex items-stretch gap-2.5 pointer-events-none select-none">
            
            {/* Panel de Contenido Desplegable */}
            {activeSidebarTab && (
              <div className="w-[20vw] min-w-[260px] bg-background border border-foreground/15 shadow-2xl rounded-xl flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-3 duration-250">
                
                {/* Cabecera del Subpanel */}
                <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between flex-shrink-0 bg-foreground/[0.01]">
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary">
                    {activeSidebarTab === 'levels' && "Niveles del Atlas"}
                    {activeSidebarTab === 'notes' && "Anotaciones de Lore"}
                    {activeSidebarTab === 'info' && "Detalles del Atlas"}
                  </h3>
                  <button 
                    onClick={() => setActiveSidebarTab(null)}
                    className="size-6 rounded-md hover:bg-foreground/5 text-foreground/40 hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                {/* Contenido Dinámico */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                  {activeSidebarTab === 'levels' && (
                    <>
                      <div className="space-y-1 overflow-visible">
                        {levels.map(lvl => {
                          const isLevelActive = activeLevelId === lvl.id;
                          const levelNameClass = isLevelActive 
                            ? 'bg-primary/10 text-primary border-primary/20 font-bold' 
                            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5 border-transparent';

                          return (
                            <div 
                              key={lvl.id}
                              className={`group relative w-full py-2 px-3 border rounded text-[12px] flex items-center justify-between transition-all overflow-visible ${levelNameClass}`}
                            >
                              {/* Icono de Opacidad (Hover lateral) */}
                              <div 
                                className="relative mr-2 flex items-center justify-center cursor-pointer text-foreground/45 hover:text-primary z-20 py-1"
                                onMouseEnter={() => setHoveredLevelOpacityId(lvl.id)}
                                onMouseLeave={() => setHoveredLevelOpacityId(null)}
                              >
                                <span className="material-symbols-outlined text-[16px]">opacity</span>
                                
                                {hoveredLevelOpacityId === lvl.id && (
                                  <div 
                                    className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-background border border-foreground/15 rounded p-3 shadow-2xl z-[999] flex items-center gap-3 w-48 text-foreground lateral-slider-bubble"
                                    onMouseEnter={() => setHoveredLevelOpacityId(lvl.id)}
                                    onMouseLeave={() => setHoveredLevelOpacityId(null)}
                                  >
                                    <span className="material-symbols-outlined text-[14px] text-primary">opacity</span>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      value={Math.round((levelOpacities[lvl.id] ?? 1) * 100)}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) / 100;
                                        const nextOpacities = { ...levelOpacities, [lvl.id]: val };
                                        setLevelOpacities(nextOpacities);
                                        updateAtlasCache({ levelOpacities: nextOpacities });
                                      }}
                                      className="w-full accent-primary bg-foreground/10 h-1 rounded cursor-pointer appearance-none outline-none"
                                    />
                                    <span className="font-mono text-[10px] text-foreground/70 min-w-[24px]">
                                      {Math.round((levelOpacities[lvl.id] ?? 1) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              {editingLevelId === lvl.id ? (
                                <input 
                                  type="text"
                                  value={levelInputText}
                                  onChange={(e) => setLevelInputText(e.target.value)}
                                  onBlur={() => {
                                    handleSaveEditLevel(lvl.id, levelInputText);
                                    setEditingLevelId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEditLevel(lvl.id, levelInputText);
                                      setEditingLevelId(null);
                                    }
                                  }}
                                  className="bg-foreground/[0.03] text-foreground border border-foreground/15 rounded px-2 py-0.5 outline-none font-sans text-xs w-[110px] z-10"
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className="cursor-pointer flex-1 select-none text-left" 
                                  onClick={() => handleTeleport(lvl.id)}
                                >
                                  {lvl.name}
                                </span>
                              )}

                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e: any) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const dataUrl = event.target?.result as string;
                                          handleUploadLevelBgImage(lvl.id, dataUrl);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="text-foreground/45 hover:text-primary transition-colors flex items-center justify-center"
                                  title="Subir plano/calco para esta capa"
                                >
                                  <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingLevelId(lvl.id);
                                    setLevelInputText(lvl.name);
                                  }} 
                                  className="text-foreground/40 hover:text-foreground"
                                >
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteLevel(lvl.id)} 
                                  className="text-foreground/30 hover:text-red-400"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-foreground/5 bg-transparent">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Nuevo nivel..."
                            value={newLevelName}
                            onChange={(e) => setNewLevelName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddLevel(newLevelName, newLevelPosition);
                                setNewLevelName('');
                              }
                            }}
                            className="flex-1 bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-3 py-1.5 font-sans text-xs outline-none focus:border-foreground/20 placeholder:text-foreground/30"
                          />
                          <button 
                            onClick={() => {
                              handleAddLevel(newLevelName, newLevelPosition);
                              setNewLevelName('');
                            }}
                            className="size-8 rounded bg-primary/15 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
                            title="Añadir Nivel"
                          >
                            <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] px-1 text-foreground/45">
                          <span>Alinear en el Atlas:</span>
                          <div className="flex border border-foreground/10 p-[1px] rounded bg-foreground/[0.02]">
                            <button
                              type="button"
                              onClick={() => setNewLevelPosition('above')}
                              className={`px-2 py-0.5 rounded-sm transition-all text-[9px] uppercase tracking-wider ${newLevelPosition === 'above' ? 'bg-primary/25 text-primary font-bold' : 'text-foreground/40 hover:text-foreground'}`}
                              title="Colocar por encima en el apilamiento de capas"
                            >
                              Superior
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewLevelPosition('below')}
                              className={`px-2 py-0.5 rounded-sm transition-all text-[9px] uppercase tracking-wider ${newLevelPosition === 'below' ? 'bg-primary/25 text-primary font-bold' : 'text-foreground/40 hover:text-foreground'}`}
                              title="Colocar por debajo en el apilamiento de capas"
                            >
                              Inferior
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeSidebarTab === 'notes' && (
                    <>
                      <div className="space-y-3">
                        {annotations.length === 0 ? (
                          <p className="font-serif text-[12px] italic text-foreground/30 text-center py-4">Sin anotaciones en el Atlas.</p>
                        ) : (
                          annotations.map(ann => {
                            const linkedLevel = levels.find(l => l.id === ann.levelId);
                            const isCurrentLevel = activeLevelId === ann.levelId;
                            const annotationCardClass = isCurrentLevel 
                              ? 'bg-foreground/[0.03] border-primary/20' 
                              : 'bg-foreground/[0.01] border-foreground/5';

                            return (
                              <div key={ann.id} className={`group border p-3 rounded relative ${annotationCardClass}`}>
                                {editingAnnotationId === ann.id ? (
                                  <div className="space-y-2">
                                    <textarea 
                                      value={annotationInputText}
                                      onChange={(e) => setAnnotationInputText(e.target.value)}
                                      className="w-full bg-background text-foreground border border-foreground/15 rounded p-2 outline-none font-serif text-[12px] leading-relaxed resize-none h-16"
                                      autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="font-sans text-[10px] text-foreground/40">Referencia:</span>
                                      <select 
                                        value={annotationInputLevelId} 
                                        onChange={(e) => setAnnotationInputLevelId(e.target.value)}
                                        className="bg-background text-foreground border border-foreground/10 text-[10px] rounded p-1 outline-none cursor-pointer"
                                      >
                                        {levels.map(l => (
                                          <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        handleSaveEditAnnotation(ann.id, annotationInputText, annotationInputLevelId);
                                        setEditingAnnotationId(null);
                                      }}
                                      className="px-3 py-1 bg-primary text-primary-foreground text-[10px] rounded"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {linkedLevel && (
                                      <span 
                                        onClick={() => handleTeleport(linkedLevel.id)}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all border 
                                          ${isCurrentLevel ? 'bg-primary/20 text-primary border-primary/30' : 'bg-foreground/5 text-foreground/40 border-foreground/10 hover:bg-foreground/10'}`}
                                        title="Sincronizar Atlas con este nivel"
                                      >
                                        <span className="material-symbols-outlined text-[10px]">link</span>
                                        {linkedLevel.name.split(':')[0]}
                                      </span>
                                    )}
                                    <p className="font-serif text-[13px] italic text-foreground/75 leading-relaxed pr-8">
                                      "{ann.text}"
                                    </p>
                                  </div>
                                )}

                                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingAnnotationId(ann.id);
                                      setAnnotationInputText(ann.text);
                                      setAnnotationInputLevelId(ann.levelId);
                                    }} 
                                    className="text-foreground/40 hover:text-foreground"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAnnotation(ann.id)} 
                                    className="text-foreground/30 hover:text-red-400"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <textarea 
                          placeholder="Nueva anotación de lore..."
                          value={newAnnotationText}
                          onChange={(e) => setNewAnnotationText(e.target.value)}
                          className="w-full bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-2.5 py-1.5 font-serif text-[12px] outline-none focus:border-foreground/20 placeholder:text-foreground/30 resize-none h-16 leading-relaxed"
                        />
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="font-sans text-[11px] text-foreground/45">Vincular nivel:</span>
                          <select 
                            value={newAnnotationLevelId} 
                            onChange={(e) => setNewAnnotationLevelId(e.target.value)}
                            className="bg-background text-foreground border border-foreground/10 rounded p-1 outline-none cursor-pointer text-xs"
                          >
                            {levels.map(l => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={() => {
                            handleAddAnnotation(newAnnotationText, newAnnotationLevelId);
                            setNewAnnotationText('');
                          }}
                          className="w-full py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-primary font-sans text-xs rounded transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span> Agregar Nota
                        </button>
                      </div>
                    </>
                  )}

                  {activeSidebarTab === 'info' && (
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[9px] tracking-[0.25em] text-foreground/45 uppercase block mb-1">Atlas Activo</span>
                        <h2 className="font-serif text-[1.4rem] text-foreground font-semibold leading-tight">{map.nombre || 'Supermapa'}</h2>
                        <p className="font-sans text-[11px] text-foreground/45 mt-1">{map.descripcion || 'Visor de cotas de altitud'}</p>
                      </div>
                      <div className="pt-4 border-t border-foreground/10 space-y-3 bg-transparent">
                        <span className="font-sans text-[11px] font-bold text-foreground/45 block">Estadísticas Rápidas</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-lg text-center">
                            <span className="font-mono text-lg font-bold text-primary">{levels.length}</span>
                            <span className="text-[9px] uppercase tracking-wider text-foreground/40 block mt-0.5">Niveles</span>
                          </div>
                          <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-lg text-center">
                            <span className="font-mono text-lg font-bold text-primary">{annotations.length}</span>
                            <span className="text-[9px] uppercase tracking-wider text-foreground/40 block mt-0.5">Notas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Barra de Actividad (Iconos Estilo VS Code) */}
            <div className="w-[48px] bg-background border border-foreground/15 shadow-2xl rounded-xl flex flex-col items-center py-4 gap-4 pointer-events-auto text-foreground">
              
              {/* Tab: Niveles */}
              <div className="relative group flex items-center justify-center">
                <button 
                  onClick={() => setActiveSidebarTab(activeSidebarTab === 'levels' ? null : 'levels')}
                  className={`size-9 rounded-lg flex items-center justify-center transition-all ${activeSidebarTab === 'levels' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-background border border-foreground/15 px-2.5 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider text-foreground whitespace-nowrap shadow-2xl z-50">
                  Niveles del Atlas
                </div>
              </div>

              {/* Tab: Anotaciones */}
              <div className="relative group flex items-center justify-center">
                <button 
                  onClick={() => setActiveSidebarTab(activeSidebarTab === 'notes' ? null : 'notes')}
                  className={`size-9 rounded-lg flex items-center justify-center transition-all ${activeSidebarTab === 'notes' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-background border border-foreground/15 px-2.5 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider text-foreground whitespace-nowrap shadow-2xl z-50">
                  Anotaciones de Lore
                </div>
              </div>

              {/* Separador sutil */}
              <div className="w-6 h-px bg-foreground/10 my-1" />

              {/* Tab: Info/Ajustes */}
              <div className="relative group flex items-center justify-center">
                <button 
                  onClick={() => setActiveSidebarTab(activeSidebarTab === 'info' ? null : 'info')}
                  className={`size-9 rounded-lg flex items-center justify-center transition-all ${activeSidebarTab === 'info' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">info</span>
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-background border border-foreground/15 px-2.5 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider text-foreground whitespace-nowrap shadow-2xl z-50">
                  Detalles del Atlas
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* --- CONTROLES CENTRALES UNIFICADOS (CÁPSULA DE CONTROL - OPACO SIN BLUR - Visible siempre) --- */}
      <div className="absolute top-[84px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-background border border-foreground/15 px-4 py-2 rounded-full shadow-2xl text-foreground">
          
          {/* Botón de Retroceso (Salir del Atlas) */}
          <button 
            onClick={handleBack}
            className="size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-foreground/5 flex items-center justify-center transition-all"
            title="Salir del Atlas"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">arrow_back</span>
          </button>
          <div className="h-4 w-px bg-foreground/10" />

          {/* Selector de Vista (2D/3D) */}
          <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03]">
              <button 
                  onClick={() => setViewMode('2D')}
                  className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${viewMode === '2D' ? 'bg-primary text-primary-foreground' : 'text-foreground/40 hover:text-foreground'}`}
              >
                  <span className="material-symbols-outlined text-[13px]">draw</span> 2D
              </button>
              <button 
                  onClick={() => setViewMode('3D')}
                  className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${viewMode === '3D' ? 'bg-primary text-primary-foreground' : 'text-foreground/40 hover:text-foreground'}`}
              >
                  <span className="material-symbols-outlined text-[13px]">language</span> 3D
              </button>
          </div>

          {/* Selector de Modo EDITAR/VER (Solo en 2D) */}
          {viewMode === '2D' && (
              <>
                  <div className="h-4 w-px bg-foreground/10" />
                  <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03]">
                      <button 
                          onClick={() => setAppMode('EDIT')}
                          className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${appMode === 'EDIT' ? 'bg-primary text-primary-foreground' : 'text-foreground/40 hover:text-foreground'}`}
                      >
                          <span className="material-symbols-outlined text-[13px]">edit_square</span> Editar
                      </button>
                      <button 
                          onClick={() => setAppMode('VIEW')}
                          className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${appMode === 'VIEW' ? 'bg-primary text-primary-foreground' : 'text-foreground/40 hover:text-foreground'}`}
                      >
                          <span className="material-symbols-outlined text-[13px]">layers</span> Ver
                      </button>
                  </div>
              </>
          )}

          {/* Selector de Nivel (Solo en 2D) */}
          {viewMode === '2D' && (
            <>
              <div className="h-4 w-px bg-foreground/10" />
              <div className="flex items-center gap-1.5 bg-foreground/[0.03] border border-foreground/10 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px] text-foreground/50">layers</span>
                  <select 
                      value={activeLevelId} 
                      onChange={(e) => handleTeleport(e.target.value)}
                      className="bg-transparent text-foreground border-none text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer pr-1"
                  >
                      {levels.map(l => (
                          <option key={l.id} value={l.id} className="bg-background text-foreground text-[10px] font-bold uppercase tracking-wider">{l.name.split(':')[0]}</option>
                      ))}
                  </select>
              </div>
            </>
          )}

          {/* Toggle de Superposición de Capas (Solo en 2D Ver) */}
          {viewMode === '2D' && appMode === 'VIEW' && (
            <>
              <div className="h-4 w-px bg-foreground/10" />
              <button
                onClick={() => setOverlayAllLayers(!overlayAllLayers)}
                className={`px-3 py-1.5 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${overlayAllLayers ? 'bg-primary/20 text-primary border border-primary/25' : 'text-foreground/45 hover:text-foreground border border-foreground/10'}`}
                title={overlayAllLayers ? "Ver solo la capa seleccionada" : "Superponer todas las capas del Atlas"}
              >
                <span className="material-symbols-outlined text-[13px]">{overlayAllLayers ? 'sheets' : 'layers_clear'}</span>
                {overlayAllLayers ? 'Ver Todas' : 'Solo Activa'}
              </button>
            </>
          )}

          {/* Controles de Dibujo (Solo en 2D Editar) */}
          {viewMode === '2D' && appMode === 'EDIT' && (
              <>
                  <div className="h-4 w-px bg-foreground/10" />
                  
                  <div className="flex items-center gap-1 relative">
                      
                      {/* Ajustes de Pincel */}
                      <button 
                          onClick={() => setActiveMenu(activeMenu === 'brush' ? null : 'brush')}
                          className={`size-8 rounded-full flex items-center justify-center transition-all ${activeMenu === 'brush' ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
                          title="Ajustes de Tinta"
                      >
                          <span className="material-symbols-outlined text-[18px]">brush</span>
                      </button>

                      {/* POPOVER BOCADILLO: Ajustes de Pincel (Opaco sin blur) */}
                      {activeMenu === 'brush' && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-background border border-foreground/15 p-4 rounded-xl shadow-2xl z-50 speech-bubble text-foreground animate-in fade-in slide-in-from-top-2 duration-200">
                              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-2">Herramienta</span>
                              <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03] mb-4">
                                  <button 
                                      onClick={() => setDrawTool('brush')}
                                      className={`flex-1 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${drawTool === 'brush' ? 'bg-primary text-primary-foreground' : 'text-foreground/40'}`}
                                  >
                                      Pincel
                                  </button>
                                  <button 
                                      onClick={() => setDrawTool('eraser')}
                                      className={`flex-1 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${drawTool === 'eraser' ? 'bg-primary text-primary-foreground' : 'text-foreground/40'}`}
                                  >
                                      Borrador
                                  </button>
                              </div>

                              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Color de tinta</span>
                              <div className="grid grid-cols-5 gap-1.5 mb-4">
                                  {['#6e78fa', '#f87171', '#4ade80', '#fbbf24', '#f472b6'].map(c => (
                                      <button 
                                          key={c}
                                          onClick={() => {
                                            setBrushColor(c);
                                            saveAtlasState({ brushColor: c });
                                          }}
                                          className={`size-6 rounded-full border border-foreground/15 flex items-center justify-center transition-transform hover:scale-110`}
                                          style={{ backgroundColor: c }}
                                      >
                                          {brushColor === c && <span className="size-2 rounded-full bg-background" />}
                                      </button>
                                  ))}
                              </div>

                              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Grosor: {brushSize}px</span>
                              <input 
                                  type="range" 
                                  min="1" 
                                  max="20" 
                                  value={brushSize}
                                  onChange={(e) => {
                                      const size = parseInt(e.target.value);
                                      setBrushSize(size);
                                      saveAtlasState({ brushSize: size });
                                  }}
                                  className="w-full accent-primary bg-foreground/10 h-1 rounded cursor-pointer appearance-none outline-none mb-4"
                              />

                              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Opacidad calco: {Math.round(backdropOpacity * 100)}%</span>
                              <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={Math.round(backdropOpacity * 100)}
                                  onChange={(e) => {
                                      const opacity = parseFloat(e.target.value) / 100;
                                      setBackdropOpacity(opacity);
                                      saveAtlasState({ backdropOpacity: opacity });
                                  }}
                                  className="w-full accent-primary bg-foreground/10 h-1 rounded cursor-pointer appearance-none outline-none"
                              />
                          </div>
                      )}

                      {/* Limpiar Canvas */}
                      <button 
                          onClick={handleClearCanvas}
                          className="size-8 rounded-full flex items-center justify-center text-foreground/60 hover:bg-foreground/5 hover:text-red-400 transition-all"
                          title="Limpiar Capa"
                      >
                          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                      </button>
                  </div>
              </>
          )}

        </div>

    </div>
  );
};

export default InteractiveMapView;
