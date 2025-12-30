import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterView from './CharacterView';
import LocationView from './LocationView';
import CollectiveView from './CollectiveView';
import CosmicHierarchyView from './CosmicHierarchyView';
import TerritoryGridView from './TerritoryGridView';

const EntityRouter = () => {
    const { type, entityId } = useParams();

    const renderView = () => {
        const lowerType = type?.toLowerCase();

        switch (lowerType) {
            case 'character':
            case 'entidadindividual':
                return <CharacterView id={entityId} />;
            case 'location':
            case 'zona':
                return <LocationView id={entityId} />;
            case 'culture':
            case 'entidadcolectiva':
                return <CollectiveView id={entityId} />;
            case 'universe':
            case 'galaxy':
            case 'system':
                return <CosmicHierarchyView id={entityId} type={lowerType} />;
            case 'planet':
                return <TerritoryGridView id={entityId} />;
            case 'construccion':
                return <LocationView id={entityId} />; // Reusing LocationView for now
            case 'efectos':
                return <div className="p-8 text-white">Effect/Spell View for ID: {id}</div>;
            case 'interaccion':
                return <div className="p-8 text-white">Interaction/Event View for ID: {id}</div>;
            case 'magic':
                return <div className="p-8 text-white">Magic System View for ID: {id}</div>;
            default:
                return <div className="p-8 text-white">Unknown Entity Type: {type}</div>;
        }
    };

    return (
        <div className="flex-1 bg-background-dark overflow-hidden">
            {renderView()}
        </div>
    );
};

export default EntityRouter;
