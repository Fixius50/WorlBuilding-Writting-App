# ERROR REPORT (React ErrorBoundary)
**Timestamp:** 2026-02-06T14:44:56.162306700
**Message:** React.useContext(...) is null

## Stack Trace
```
TransformerComponent@http://localhost:3000/jsx/pages/Linguistics/components/GlyphEditorCanvas.jsx:144:35
renderWithHooks@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:16642:36
mountIndeterminateComponent@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:20020:21
beginWork@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:21008:22
beginWork$1@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:25524:22
performUnitOfWork@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:24969:20
workLoopSync@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:24908:30
renderRootSync@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:24887:15
performSyncWorkOnRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:24614:42
flushSyncCallbacks@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:14018:30
flushSyncCallbacksOnlyInLegacyMode@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:14003:13
scheduleUpdateOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:24301:15
updateContainer@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:26568:34
StageWrap/<@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:27460:19
commitHookEffectListMount@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:16504:34
commitLayoutEffectOnFiber@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:16591:48
commitLayoutMountEffects_complete@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:17571:42
commitLayoutEffects_begin@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:17560:48
commitLayoutEffects@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:17511:36
commitRootImpl@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:18947:32
commitRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:18871:27
performSyncWorkOnRoot@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:18489:21
flushSyncCallbacks@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:8707:30
node_modules/react-dom/cjs/react-dom.development.js/ensureRootIsScheduled/<@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-F5NMHO6L.js?v=dc9487ba:18218:21

```

## Component Stack
```

StageWrap@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:27423:42
FiberProvider@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-konva.js?v=cb778ecd:27349:21
div
GlyphEditorCanvas@http://localhost:3000/jsx/pages/Linguistics/components/GlyphEditorCanvas.jsx:5:27
div
main
div
LinguisticsHub@http://localhost:3000/jsx/pages/Linguistics/LinguisticsHub.jsx?t=1770385355065:15:24
div
LinguisticsRouter@http://localhost:3000/jsx/pages/Linguistics/LinguisticsRouter.jsx?t=1770385355065:10:35
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4134:7
Outlet@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4537:20
div
main
div
ArchitectLayout@http://localhost:3000/jsx/components/layout/ArchitectLayout.jsx:86:49
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4134:7
Outlet@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4537:20
main
div
AppLayout
RenderedRoute@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4134:7
Routes@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4603:7
Router@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:4551:7
BrowserRouter@http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/react-router-dom.js?v=af510770:5294:7
div
LanguageProvider@http://localhost:3000/jsx/context/LanguageContext.jsx:8:33
App@http://localhost:3000/jsx/App.jsx?t=1770385355065:27:37
ErrorBoundary@http://localhost:3000/jsx/main.jsx?t=1770385355065:21:5
```