'use client';

import { useState } from 'react';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';

interface UniverseOutlinerProps {
    className?: string;
}

interface TreeNode {
    id: string;
    name: string;
    type: 'universe' | 'spacetime' | 'galaxy' | 'system' | 'planet' | 'region' | 'character' | 'item' | 'rule';
    children?: TreeNode[];
}

// Mock data - will be replaced with SQLite queries
const mockTree: TreeNode = {
    id: '1',
    name: 'My Universe',
    type: 'universe',
    children: [
        {
            id: '2',
            name: 'Earth System',
            type: 'system',
            children: [
                {
                    id: '3',
                    name: 'Earth',
                    type: 'planet',
                    children: [
                        { id: '4', name: 'Europe', type: 'region' },
                        { id: '5', name: 'Asia', type: 'region' },
                    ]
                },
                { id: '6', name: 'Mars', type: 'planet' },
            ]
        },
        {
            id: '7',
            name: 'Characters',
            type: 'character',
            children: [
                { id: '8', name: 'King Arthur', type: 'character' },
                { id: '9', name: 'Merlin', type: 'character' },
            ]
        },
        {
            id: '10',
            name: 'Items',
            type: 'item',
            children: [
                { id: '11', name: 'Excalibur', type: 'item' },
            ]
        },
    ]
};

const getTypeIcon = (type: TreeNode['type']) => {
    switch (type) {
        case 'universe':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                </svg>
            );
        case 'spacetime':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );
        case 'galaxy':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                </svg>
            );
        case 'system':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="M4.93 4.93l1.41 1.41" />
                    <path d="M17.66 17.66l1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="M6.34 17.66l-1.41 1.41" />
                    <path d="M19.07 4.93l-1.41 1.41" />
                </svg>
            );
        case 'planet':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            );
        case 'region':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            );
        case 'character':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
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

const getTypeColor = (type: TreeNode['type']) => {
    switch (type) {
        case 'universe': return 'text-purple-400';
        case 'spacetime': return 'text-cyan-400';
        case 'galaxy': return 'text-indigo-400';
        case 'system': return 'text-yellow-400';
        case 'planet': return 'text-blue-400';
        case 'region': return 'text-teal-400';
        case 'character': return 'text-green-400';
        case 'item': return 'text-amber-400';
        case 'rule': return 'text-rose-400';
        default: return 'text-gray-400';
    }
};

function TreeNodeComponent({ node, level = 0 }: { node: TreeNode; level?: number }) {
    const [expanded, setExpanded] = useState(level < 2);
    const hasChildren = node.children && node.children.length > 0;
    const { setPlanet } = useCosmosStore();

    const handleClick = () => {
        if (hasChildren) {
            setExpanded(!expanded);
        }
        if (node.type === 'planet') {
            setPlanet(node.id);
        }
    };

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {hasChildren ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
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
                <span className="text-[10px] text-muted-foreground ml-auto">{node.type}</span>
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNodeComponent key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function UniverseOutliner({ className = '' }: UniverseOutlinerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { getContextPath, isDivergent } = useCosmosStore();
    const contextPath = getContextPath();

    return (
        <aside className={`flex flex-col h-full bg-card border-r border-border ${className}`}>
            {/* Header with Context Path */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {contextPath.map((segment, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span>›</span>}
                            <span className={i === contextPath.length - 1 ? 'text-foreground font-medium' : ''}>
                                {segment}
                            </span>
                        </span>
                    ))}
                </div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                    </svg>
                    Universe Outliner
                    {isDivergent() && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">DIVERGENT</span>
                    )}
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
                <TreeNodeComponent node={mockTree} />
            </div>

            {/* Actions */}
            <div className="p-2 border-t border-border space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Entity
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Create What-If
                </button>
            </div>
        </aside>
    );
}
