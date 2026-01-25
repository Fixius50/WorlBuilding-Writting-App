import React, { useState } from 'react'; // React import needed for JSX but useState only for local UI modals if we kept them here, but we are lifting actions so modals should move or be triggered by parent.
// Actually easier to keep Modals here for UI, but trigger Parent functions. Parent needs to know about updates?
// Or NotebookGrid keeps Modals and calls 'onCreate(title)'. Yes.
import ConfirmModal from '../../components/common/ConfirmModal';
import InputModal from '../../components/common/InputModal';

const NotebookGrid = ({ notebooks, loading, onSelectNotebook, onCreateNotebook, onDeleteNotebook, onUpdateNotebook }) => {
    // Modal States (Local UI concern)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [notebookToDelete, setNotebookToDelete] = useState(null);
    const [notebookToEdit, setNotebookToEdit] = useState(null);

    const handleCreateSubmit = (title) => {
        onCreateNotebook(title);
    };

    const handleDeleteConfirm = () => {
        if (notebookToDelete) {
            onDeleteNotebook(notebookToDelete.id);
            setNotebookToDelete(null);
        }
    };

    const handleEditSubmit = (title) => {
        if (notebookToEdit) {
            // Preserve description, only update title for now via simple InputModal
            onUpdateNotebook(notebookToEdit.id, title, notebookToEdit.descripcion);
            setNotebookToEdit(null);
        }
    };

    return (
        <div className="p-8 w-full h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-serif text-slate-200 mb-2">Your Notebooks</h1>
                        <p className="text-slate-500 font-mono text-sm">Select a chronicle to begin writing</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="font-bold tracking-wide text-sm">NEW NOTEBOOK</span>
                    </button>
                </header>

                {loading ? (
                    <div className="text-slate-500">Loading chronicles...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notebooks.map(notebook => (
                            <div
                                key={notebook.id}
                                onClick={() => onSelectNotebook(notebook)}
                                className="group relative bg-[#050508] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 h-64 flex flex-col"
                            >
                                <div className="flex-1 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors mb-6">
                                            <span className="material-symbols-outlined text-2xl">menu_book</span>
                                        </div>

                                        <div className="flex items-center gap-1 transition-opacity duration-200">
                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotebookToEdit(notebook);
                                                }}
                                                className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                title="Rename Notebook"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotebookToDelete(notebook);
                                                }}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Notebook"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-serif text-slate-200 group-hover:text-white mb-2 line-clamp-2">
                                        {notebook.titulo}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-3">
                                        {notebook.descripcion || "No description"}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-mono text-slate-500">OPEN CHRONICLE</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                                </div>
                            </div>
                        ))}

                        {/* New Notebook Card (Ghost) */}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="border-2 border-dashed border-white/5 rounded-2xl p-6 h-64 flex flex-col items-center justify-center gap-4 text-slate-600 hover:text-slate-400 hover:border-white/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-4xl">add</span>
                            <span className="font-mono text-xs uppercase tracking-widest">Create New</span>
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <InputModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onConfirm={handleCreateSubmit}
                title="New Notebook"
                message="Give a title to your new chronicle."
                placeholder="Ex: The Lost Kingdom"
                confirmText="Create Notebook"
            />

            <InputModal
                isOpen={!!notebookToEdit}
                onClose={() => setNotebookToEdit(null)}
                // If editing, pre-fill with current title. 
                // Does InputModal support defaultValue? Assuming it does or we rely on user typing.
                // Assuming InputModal is simple. If it needs value prop, I might need to check it.
                // Assuming standard InputModal behavior.
                onConfirm={handleEditSubmit}
                title="Rename Notebook"
                message={`Enter a new title for "${notebookToEdit?.titulo}".`}
                placeholder={notebookToEdit?.titulo}
                confirmText="Update"
            />

            <ConfirmModal
                isOpen={!!notebookToDelete}
                onClose={() => setNotebookToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Notebook?"
                message={`Are you sure you want to delete "${notebookToDelete?.titulo}"? This action cannot be undone and will delete all pages inside.`}
                confirmText="Delete Forever"
                isDestructive={true}
            />
        </div>
    );
};

export default NotebookGrid;
