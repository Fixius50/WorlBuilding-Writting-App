'use client';

import { useState } from 'react';

interface SidebarProps {
    className?: string;
}

interface EntityNode {
    id: string;
    name: string;
    type: 'actor' | 'location' | 'item' | 'rule';
    children?: EntityNode[];
}

// Mock entity tree (will be replaced with SQLite queries)
const mockEntityTree: EntityNode[] = [
    {
        id: '1',
        name: 'Characters',
        type: 'actor',
        children: [
            { id: '1-1', name: 'Gandalf', type: 'actor' },
            { id: '1-2', name: 'Frodo', type: 'actor' },
            { id: '1-3', name: 'Aragorn', type: 'actor' },
        ]
    },
    {
        id: '2',
        name: 'Locations',
        type: 'location',
        children: [
            { id: '2-1', name: 'The Shire', type: 'location' },
            { id: '2-2', name: 'Mordor', type: 'location' },
            { id: '2-3', name: 'Rivendell', type: 'location' },
        ]
    },
    {
        id: '3',
        name: 'Items',
        type: 'item',
        children: [
            { id: '3-1', name: 'The One Ring', type: 'item' },
            { id: '3-2', name: "Gandalf's Staff", type: 'item' },
        ]
    },
    {
        id: '4',
        name: 'Rules & Systems',
        type: 'rule',
        children: [
            { id: '4-1', name: 'Magic System', type: 'rule' },
        ]
    },
];

const getTypeIcon = (type: EntityNode['type']) => {
    switch (type) {
        case 'actor':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case 'location':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            );
        case 'item':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        case 'rule':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                </svg>
            );
    }
};

const getTypeColor = (type: EntityNode['type']) => {
    switch (type) {
        case 'actor': return 'text-green-400';
        case 'location': return 'text-blue-400';
        case 'item': return 'text-yellow-400';
        case 'rule': return 'text-purple-400';
    }
};

function TreeNode({ node, level = 0 }: { node: EntityNode; level?: number }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors ${getTypeColor(node.type)}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {hasChildren ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                ) : (
                    <span className="w-3" />
                )}
                <span className={getTypeColor(node.type)}>{getTypeIcon(node.type)}</span>
                <span className="text-sm text-foreground truncate">{node.name}</span>
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar({ className = '' }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <aside className={`flex flex-col h-full bg-card border-r border-border ${className}`}>
            {/* Header */}
            <div className="p-3 border-b border-border">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Entities
                </h2>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search entities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Entity Tree */}
            <div className="flex-1 overflow-auto p-2">
                {mockEntityTree.map((node) => (
                    <TreeNode key={node.id} node={node} />
                ))}
            </div>

            {/* Actions */}
            <div className="p-2 border-t border-border">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Entity
                </button>
            </div>
        </aside>
    );
}
