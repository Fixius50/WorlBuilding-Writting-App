import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@assets/index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { initializeDatabase } from '@database';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

// --- Global Handlers ---
const reportError = (source: string, message: string, _stack?: string) => {
  // Preservado para futura integración con logger local
  // console.error(`[${source}]`, message, _stack);
};

window.onerror = (message, source, lineno, colno, error) => {
  reportError('Global Window Error', typeof message === 'string' ? message : 'Unknown error', error ? error.stack : `${source}:${lineno}:${colno}`);
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  reportError('Unhandled Promise Rejection', event.reason ? event.reason.message : 'Unknown reason', event.reason ? event.reason.stack : '');
};

// --- Global Error Fallback UI ---
const GlobalErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const errMsg = error instanceof Error ? error.message : String(error);
  return (
    <div style={{ padding: '40px', background: 'var(--background, #fff)', color: 'var(--foreground, #333)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', opacity: 0.8 }}>Error de Aplicación</h1>
      <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '24px', maxWidth: '400px', textAlign: 'center' }}>
        Se ha producido un error inesperado en la interfaz.
      </p>
      <details style={{ background: 'rgba(128,128,128,0.05)', padding: '12px', borderRadius: '4px', maxWidth: '600px', fontSize: '11px', opacity: 0.8, marginBottom: '24px', border: '1px solid rgba(128,128,128,0.1)' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver detalles técnicos</summary>
        <pre style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>{errMsg}</pre>
      </details>
      <button
        onClick={() => {
          window.history.back();
          // Pequeño delay para dar tiempo a que cambie la URL antes de intentar re-renderizar
          setTimeout(resetErrorBoundary, 50);
        }}
        style={{ padding: '8px 24px', border: '1px solid currentColor', background: 'transparent', color: 'inherit', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: 0.8 }}
      >
        Volver Atrás
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  // Inicializar la base de datos local antes de renderizar la app
  initializeDatabase()
    .then(() => {
      root.render(
        <React.StrictMode>
          <ErrorBoundary
            FallbackComponent={GlobalErrorFallback}
            onError={(error, info) => reportError('React ErrorBoundary', error instanceof Error ? error.message : String(error), info.componentStack ?? undefined)}
          >
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
    })
    .catch(err => {
      root.render(
        <div style={{ padding: 20, color: 'white', background: '#300', height: '100vh' }}>
          <h1>Error fatal al inicializar la base de datos</h1>
          <p>{err instanceof Error ? err.message : String(err)}</p>
        </div>
      );
    });
} else {
  reportError('main.tsx', 'No se encontró el elemento root en el DOM');
}
