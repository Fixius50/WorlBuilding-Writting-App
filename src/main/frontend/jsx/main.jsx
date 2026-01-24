import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../css/index.css'

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
