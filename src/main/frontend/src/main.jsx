import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/index.css'
import './assets/mentions.css' // ADDED

// --- TAURI DEV POLYFILL ---
// En modo Vite (navegador), `invoke` no existe. Simulamos sus respuestas para poder
// desarrollar y probar el flujo de UI sin necesitar el ejecutable nativo de Tauri.
if (typeof window !== 'undefined' && !window.__TAURI_INTERNALS__) {
    const DEV_WORKSPACES_KEY = '__dev_workspaces__';
    const getWorkspaces = () => JSON.parse(localStorage.getItem(DEV_WORKSPACES_KEY) || '[]');
    const saveWorkspaces = (ws) => localStorage.setItem(DEV_WORKSPACES_KEY, JSON.stringify(ws));

    window.__TAURI_POLYFILL__ = true;
    // Inyectamos invoke en el módulo de Tauri de forma mockeable
    window.__TAURI_INVOKE_MOCK__ = async (cmd, args = {}) => {
        console.log(`[Tauri Dev Polyfill] invoke('${cmd}')`, args);
        if (cmd === 'get_proyectos') {
            return getWorkspaces();
        }
        if (cmd === 'create_proyecto') {
            const existing = getWorkspaces();
            const initials = (args.title || args.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const newWs = { id: Date.now(), name: args.name, title: args.title, tag: args.tag, image_url: args.imageUrl, last_modified: new Date().toLocaleDateString(), initials };
            saveWorkspaces([...existing, newWs]);
            return newWs;
        }
        if (cmd === 'get_proyecto_by_name') {
            const ws = getWorkspaces().find(w => w.name === args.name);
            if (!ws) throw new Error('Project not found');
            return ws;
        }
        if (cmd === 'get_entidades') return [];
        if (cmd === 'get_eventos') return [];
        if (cmd === 'get_lenguas') return [];
        if (cmd === 'get_carpetas') return JSON.parse(localStorage.getItem('__dev_carpetas__') || '[]');
        if (cmd === 'create_carpeta') {
            const carpetas = JSON.parse(localStorage.getItem('__dev_carpetas__') || '[]');
            const nueva = { id: Date.now(), nombre: args.nombre, project_id: args.projectId, padre_id: args.padreId || null, tipo: args.tipo || 'FOLDER', slug: (args.nombre || 'carpeta').toLowerCase().replace(/\s+/g, '-') };
            carpetas.push(nueva);
            localStorage.setItem('__dev_carpetas__', JSON.stringify(carpetas));
            return nueva;
        }
        if (cmd === 'update_carpeta') {
            const carpetas = JSON.parse(localStorage.getItem('__dev_carpetas__') || '[]');
            const idx = carpetas.findIndex(c => c.id === args.id);
            if (idx !== -1) { carpetas[idx].nombre = args.nombre; localStorage.setItem('__dev_carpetas__', JSON.stringify(carpetas)); }
            return true;
        }
        if (cmd === 'delete_carpeta') {
            const carpetas = JSON.parse(localStorage.getItem('__dev_carpetas__') || '[]').filter(c => c.id !== args.id);
            localStorage.setItem('__dev_carpetas__', JSON.stringify(carpetas));
            return true;
        }
        if (cmd === 'delete_entidad') return true;
        if (cmd === 'get_carpeta_by_slug') return null;
        if (cmd === 'export_backup') throw new Error('Backup solo disponible en app nativa Tauri');
        throw new Error(`Tauri polyfill: comando '${cmd}' no implementado en dev mode`);
    };
}


const reportError = (source, message, stack, componentStack = '') => {
    fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, message, stack, componentStack })
    }).catch(err => console.error("Failed to send error log:", err));
};

// Global Handlers
window.onerror = (message, source, lineno, colno, error) => {
    reportError('Global Window Error', message, error ? error.stack : `${source}:${lineno}:${colno}`);
};

window.onunhandledrejection = (event) => {
    reportError('Unhandled Promise Rejection', event.reason ? event.reason.message : 'Unknown reason', event.reason ? event.reason.stack : '');
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error: error, errorInfo: errorInfo });
        console.error("Uncaught Error:", error, errorInfo);
        reportError('React ErrorBoundary', error.message, error.stack, errorInfo.componentStack);
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
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    console.error("React root element not found (looked for #root)");
}
