import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '@xyflow/react/dist/style.css';

import '@xyflow/react/dist/style.css';

const rootElement = document.getElementById('react-root') || document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
} else {
    console.error("React root element not found (looked for #react-root and #root)");
}
