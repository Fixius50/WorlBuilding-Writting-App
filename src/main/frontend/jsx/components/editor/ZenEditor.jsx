import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-mention';
import 'quill-mention/dist/quill.mention.css';
import api from '../../../js/services/api';

const ZenEditor = ({ content, onUpdate }) => {
    
    // Memoize modules to avoid re-initialization
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
        mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ["@"],
            source: async function(searchTerm, renderList, mentionChar) {
                if (searchTerm.length === 0) {
                    renderList([], searchTerm);
                    return;
                }
                try {
                    // Call backend search
                    const results = await api.get(`/biblia/search?q=${searchTerm}`);
                    
                    // Map to quill-mention format
                    // Assuming backend returns: [{ id: 1, nombre: "Gandalf", tipo: "Personaje", ... }]
                    const matches = results.map(entity => ({
                        id: entity.id,
                        value: entity.nombre,
                        link: `/biblia/entidad/${entity.id}`, // Link for future navigation
                        type: entity.tipo // Custom field for styling if needed
                    }));
                    
                    renderList(matches, searchTerm);
                } catch (error) {
                    console.error("Error searching entities for mention:", error);
                    renderList([], searchTerm);
                }
            },
            renderItem: function(item, searchTerm) {
                // Custom render for the dropdown list item
                return `
                    <div class="flex items-center gap-2 py-1">
                        <span class="w-2 h-2 rounded-full ${item.type === 'Personaje' ? 'bg-indigo-500' : 'bg-emerald-500'}"></span>
                        <span class="font-bold text-slate-200">${item.value}</span>
                        <span class="text-xs text-slate-500 ml-auto uppercase tracking-wider">${item.type || 'Entity'}</span>
                    </div>
                `;
            }
        }
    }), []);

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
