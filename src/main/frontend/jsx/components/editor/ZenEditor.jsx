import React, { useRef, useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const ZenEditor = ({ content, onUpdate }) => {
    const quillRef = useRef(null)

    // Custom Toolbar options (Google Docs style)
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            ['link', 'clean'],                                 // remove formatting button
        ],
    }), [])

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link'
    ]

    return (
        <div className="w-full h-full zen-quill-container">
            <style>{`
                /* Custom Override for Dark/Zen Mode */
                .zen-quill-container .ql-container.ql-snow {
                    border: none;
                }
                .zen-quill-container .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    margin-bottom: 1rem;
                }
                .zen-quill-container .ql-editor {
                    font-family: 'Times New Roman', serif; /* Font Serif preference */
                    font-size: 1.125rem; /* lg */
                    line-height: 1.625;
                    color: black; /* Text color inside paper */
                    min-height: 500px;
                    padding: 0;
                }
                /* Hide placeholder in print mode if needed, but useful in web */
                .zen-quill-container .ql-editor.ql-blank::before {
                    color: rgba(0,0,0,0.4);
                    font-style: italic;
                }
            `}</style>

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content || ''}
                onChange={onUpdate}
                modules={modules}
                formats={formats}
                className="h-full"
                placeholder="Start writing..."
            />
        </div>
    )
}

export default ZenEditor
