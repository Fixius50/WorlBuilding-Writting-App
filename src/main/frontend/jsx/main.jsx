import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../css/index.css'

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("React root element not found (looked for #root)");
}
