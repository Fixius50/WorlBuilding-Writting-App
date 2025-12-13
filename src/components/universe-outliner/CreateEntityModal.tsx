'use client';

/**
 * CreateEntityModal - Modal para crear nuevas entidades
 */

import { useState } from 'react';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';
import { createEntity, createFact, EntityType } from '@/lib/db/local-database';

interface CreateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    parentId: string | null;
    projectId: string;
    onCreated?: () => void;
}

const ENTITY_TYPES: { value: EntityType; label: string; icon: string }[] = [
    { value: 'galaxy', label: 'Galaxy', icon: '🌌' },
    { value: 'system', label: 'System', icon: '☀️' },
    { value: 'planet', label: 'Planet', icon: '🪐' },
    { value: 'region', label: 'Region', icon: '📍' },
    { value: 'character', label: 'Character', icon: '👤' },
    { value: 'item', label: 'Item', icon: '⭐' },
    { value: 'rule', label: 'Rule', icon: '📜' },
];

export function CreateEntityModal({
    isOpen,
    onClose,
    parentId,
    projectId,
    onCreated
}: CreateEntityModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<EntityType>('planet');
    const [isCreating, setIsCreating] = useState(false);

    const { currentSpacetimeId } = useCosmosStore();

    const handleCreate = async () => {
        if (!name.trim()) return;

        setIsCreating(true);
        try {
            // Create the entity
            const entity = createEntity({
                project_id: projectId,
                parent_id: parentId,
                type,
                time_config: null,
            });

            // Create a name fact for this entity
            // Use the current spacetime as root (Canon by default)
            const spacetimeId = currentSpacetimeId || 'canon';
            createFact({
                entity_id: entity.id,
                root_spacetime_id: spacetimeId,
                attribute: 'name',
                value: { string: name.trim() },
                valid_from_tick: 0,
                valid_until_tick: null,
            });

            console.log(`Created entity: ${name} (${type}) with id ${entity.id}`);

            setName('');
            setType('planet');
            onCreated?.();
            onClose();
        } catch (error) {
            console.error('Error creating entity:', error);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create New Entity
                </h2>

                {/* Name Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter entity name..."
                        className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
                </div>

                {/* Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {ENTITY_TYPES.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setType(t.value)}
                                className={`flex flex-col items-center p-2 rounded-md border transition-all ${type === t.value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                    }`}
                            >
                                <span className="text-lg">{t.icon}</span>
                                <span className="text-xs mt-1">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parent Info */}
                {parentId && (
                    <div className="mb-4 text-xs text-muted-foreground">
                        Parent: <code className="bg-secondary/50 px-1 rounded">{parentId.slice(0, 8)}...</code>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || isCreating}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? 'Creating...' : 'Create Entity'}
                    </button>
                </div>
            </div>
        </div>
    );
}
