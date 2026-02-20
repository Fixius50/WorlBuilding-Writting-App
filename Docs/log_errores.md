# ERROR REPORT (React ErrorBoundary)

**ESTADO: RESUELTO** (2026-02-20)
**Causa**: Desincronización de contexto de proyecto en el controlador de la Biblia del Mundo e inicialización prematura de Cytoscape.
**Solución**: Unificación de reconocimiento de proyecto vía headers y normalización de datos en el componente del grafo.

**Timestamp:** 2026-02-20T22:44:27.556068600
**Message:** can't access property "destroy", this._cy is undefined

## Stack Trace

```
componentWillUnmount@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-cytoscapejs.js?v=e1e8fcdd:873:5
callComponentWillUnmountWithTimer@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:16270:24
safelyCallComponentWillUnmount@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:16287:46
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17176:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17094:51
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17201:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
recursivelyTraverseDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17076:41
commitDeletionEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17168:49
commitDeletionEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17067:41
recursivelyTraverseMutationEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17265:38
commitMutationEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17318:49
recursivelyTraverseMutationEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17276:43
commitMutationEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17487:49
recursivelyTraverseMutationEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17276:43
commitMutationEffectsOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17385:49
commitMutationEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:17254:39
commitRootImpl@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18941:34
commitRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18871:27
performSyncWorkOnRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18489:21
flushSyncCallbacks@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:8707:30
commitRootImpl@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:19026:11
commitRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18871:27
finishConcurrentRender@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18399:25
performConcurrentWorkOnRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=43eb405b:18309:37
workLoop@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-CBZ3VTUP.js?v=43eb405b:194:50
flushWork@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-CBZ3VTUP.js?v=43eb405b:173:22
performWorkUntilDeadline@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-CBZ3VTUP.js?v=43eb405b:381:29

```

## Component Stack

```

w@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-cytoscapejs.js?v=e1e8fcdd:859:5
div
GeneralGraphView@http://localhost:3000/jsx/pages/Graph/GeneralGraphView.jsx?t=1771623741919:101:37
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4134:7
Outlet@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4537:20
div
main
div
div
ArchitectLayout@http://localhost:3000/jsx/components/layout/ArchitectLayout.jsx?t=1771623867018:87:49
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4134:7
Outlet@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4537:20
main
div
AppLayout
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4134:7
Routes@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4603:7
Router@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:4551:7
BrowserRouter@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=74431009:5294:7
div
LanguageProvider@http://localhost:3000/jsx/context/LanguageContext.jsx:8:33
App@http://localhost:3000/jsx/App.jsx?t=1771623867018:27:37
ErrorBoundary@http://localhost:3000/jsx/main.jsx?t=1771623867018:26:5
```
