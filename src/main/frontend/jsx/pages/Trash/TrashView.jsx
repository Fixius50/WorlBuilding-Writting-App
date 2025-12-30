import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';

export default function TrashView() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadItems();
    }, [projectId]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await api.get('/api/papelera/items');
            setItems(data);
            setError(null);
        } catch (err) {
            console.error("Error loading trash:", err);
            setError("Failed to load trash items.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (tipo, itemId) => {
        try {
            await api.post(`/api/papelera/restaurar/${tipo}/${itemId}`);
            loadItems(); // Reload list
        } catch (err) {
            console.error("Restoration failed", err);
            // alert("Failed to restore item."); // Removed
        }
    };

    const handleDelete = async (tipo, itemId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this item? This cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/api/papelera/eliminar/${tipo}/${itemId}`);
            loadItems(); // Reload list
        } catch (err) {
            console.error("Deletion failed", err);
            // alert("Failed to delete item."); // Removed
        }
    };

    if (loading) return <div className="text-white p-8">Loading Trash Bin...</div>;

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white p-8 overflow-y-auto">
            <h1 className="text-3xl font-light mb-2 text-white/90">Trash Bin</h1>
            <p className="text-white/50 mb-8 font-light text-sm">
                Items are automatically deleted after 30 days.
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50 border border-dashed border-white/10 rounded-xl">
                    <span className="material-symbols-outlined text-4xl mb-2">delete_outline</span>
                    <p>Trash is empty</p>
                </div>
            ) : (
                <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
                                <th className="p-4 font-normal">Name</th>
                                <th className="p-4 font-normal">Type</th>
                                <th className="p-4 font-normal">Deleted Date</th>
                                <th className="p-4 font-normal text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((item) => (
                                <tr key={`${item.tipo}-${item.id}`} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white/80 font-medium">
                                        {item.nombre || "Untitled"}
                                    </td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {item.tipo}
                                    </td>
                                    <td className="p-4 text-white/50 text-sm font-mono">
                                        {item.deleted_date ? new Date(item.deleted_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleRestore(item.tipo, item.id)}
                                            className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors border border-emerald-500/20"
                                        >
                                            RESTORE
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.tipo, item.id)}
                                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors border border-red-500/20"
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
