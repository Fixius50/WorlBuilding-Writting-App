import React, { useMemo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../js/libs/quill.mention.js';
// import 'quill-mention/dist/quill.mention.css'; // Usamos estilos personalizados definidos abajo

import api from '../../../js/services/api';

const ZenEditor = ({ content, onUpdate }) => {
    const [mentions, setMentions] = useState([]);

    // Cargar entidades para las menciones
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                // Usamos el endpoint de búsqueda o listado completo. 
                // Para simplificar y rendimiento en cliente, cargamos todas las entidades (si no son miles)
                // O podríamos usar la función source de quill-mention para buscar en servidor.
                // Por ahora, cargamos lista simple.
                const entities = await api.get('/world-bible/entities');

                const formatted = entities.map(e => ({
                    id: e.id,
                    value: e.nombre,
                    link: `/${e.proyecto?.id || 'p'}/bible/entity/${e.slug || e.id}` // Link referencial
                }));
                setMentions(formatted);
            } catch (err) {
                console.error("Error loading mentions:", err);
            }
        };

        fetchEntities();
    }, []);

    // Memoize modules to avoid re-initialization
    // IMPORTANTE: 'mention' debe estar definido aquí
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
        mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ["@"],
            source: function (searchTerm, renderList, mentionChar) {
                let values;
                if (searchTerm.length === 0) {
                    values = mentions;
                } else {
                    values = mentions.filter(m =>
                        m.value.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                // Limit results to avoid huge list
                renderList(values.slice(0, 20), searchTerm);
            },
            renderItem: (item, searchTerm) => {
                return `<div class="ql-mention-list-item-content">
                    <span class="l-name">${item.value}</span>
                </div>`;
            }
        }
    }), [mentions]); // Re-crear módulos cuando cambian las menciones (necesario para que 'source' tenga los datos)

    const handleChange = (value) => {
        if (onUpdate) {
            onUpdate(value);
        }
    };

    return (
        <div className="zen-editor-container h-full flex flex-col">
            <style>{`
                /* Dark Mode Overrides for Quill */
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.02);
                }
                .ql-container.ql-snow {
                    border: none;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .ql-editor {
                    flex: 1;
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.1rem;
                    color: #e2e8f0;
                    line-height: 1.8;
                    padding: 2rem;
                }
                .ql-editor.ql-blank::before {
                    color: rgba(255,255,255,0.2);
                    font-style: italic;
                }
                
                /* Toolbar Icons */
                .ql-snow .ql-stroke {
                    stroke: #94a3b8;
                }
                .ql-snow .ql-fill {
                    fill: #94a3b8;
                }
                .ql-snow .ql-picker {
                    color: #94a3b8;
                }

                /* --- Mention List Dark Mode Styles --- */
                .ql-mention-list-container {
                    background-color: #1e1e24 !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
                    width: 250px !important;
                    overflow: hidden !important;
                    z-index: 9999 !important;
                }

                .ql-mention-list-item {
                    padding: 8px 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    color: #e2e8f0 !important; /* Text color */
                    background: transparent !important;
                }

                .ql-mention-list-item.selected {
                    background-color: rgba(99, 102, 241, 0.2) !important; /* Indigo accent */
                    color: #ffffff !important;
                }

                .ql-mention-list-item:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                }

                /* The inserted mention chip in the editor */
                .mention {
                    background-color: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                    padding: 2px 6px;
                    border-radius: 4px;
                    user-select: all;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mention:hover {
                    background-color: rgba(99, 102, 241, 0.4);
                    color: white;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={content || ''}
                onChange={handleChange}
                modules={modules}
                className="h-full flex flex-col"
            />
        </div>
    );
};

export default ZenEditor;
