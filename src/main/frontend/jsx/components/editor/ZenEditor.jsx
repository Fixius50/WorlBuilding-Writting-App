import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom Toolbar configured for a "Google Docs" style but dark themed via CSS
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ],
};

const ZenEditor = ({ content, onUpdate }) => {
    
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
                    font-family: 'Outfit', sans-serif; /* Or generic serif if preferred */
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
