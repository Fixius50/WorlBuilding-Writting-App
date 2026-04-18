import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@assets/index.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { initializeDatabase } from '@database'

// Global Handlers (Opcional: Migrar a un logger local en el futuro)
const reportError = (source: string, message: string, stack?: string, componentStack?: string) => {
 console.error(`[${source}] ${message}`, { stack, componentStack });
};

window.onerror = (message, source, lineno, colno, error) => {
 reportError('Global Window Error', typeof message === 'string' ? message : 'Unknown error', error ? error.stack : `${source}:${lineno}:${colno}`);
};

window.onunhandledrejection = (event) => {
 reportError('Unhandled Promise Rejection', event.reason ? event.reason.message : 'Unknown reason', event.reason ? event.reason.stack : '');
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null, errorInfo: any }> {
  constructor(props: { children: React.ReactNode }) {
  super(props);
  this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: unknown) {
  return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: any) {
  const err = error as Error;
  this.setState({ error: err, errorInfo: errorInfo });
  console.error("Uncaught Error:", err, errorInfo);
  reportError('React ErrorBoundary', err.message, err.stack, errorInfo?.componentStack);
  }

 render() {
 if (this.state.hasError) {
 return (
 <div style={{ padding: 20, background: '#222', color: 'red', height: '100vh' }}>
 <h1>Something went wrong.</h1>
 <details style={{ whiteSpace: 'pre-wrap' }}>
 {this.state.error && this.state.error.toString()}
 <br />
 {this.state.errorInfo && this.state.errorInfo.componentStack}
 </details>
 </div>
 );
 }
 return this.props.children;
 }
}

const rootElement = document.getElementById('root');

if (rootElement) {
 const root = ReactDOM.createRoot(rootElement);
 
 // Inicializar base de datos antes de renderizar
 initializeDatabase()
 .then(() => {
 root.render(
 <React.StrictMode>
 <ErrorBoundary>
 <App />
 </ErrorBoundary>
 </React.StrictMode>
 );
 })
 .catch(err => {
 root.render(
 <div style={{ padding: 20, color: 'white', background: '#300', height: '100vh' }}>
 <h1>Error fatal al inicializar la base de datos</h1>
 <p>{err.message}</p>
 </div>
 );
 });
} else {
 console.error("React root element not found (looked for #root)");
}
