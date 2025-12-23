import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterView from './CharacterView';
import LocationView from './LocationView';
// import CultureView from './CultureView'; // To be implemented
// import MagicView from './MagicView'; // To be implemented

const EntityRouter = () => {
    const { type, id } = useParams();

    // In a real app, we might fetch the entity type from DB if just 'id' is passed,
    // or rely on the URL structure /entities/:type/:id

    // Mapping URL type to Component
    const renderView = () => {
        switch (type?.toLowerCase()) {
            case 'character':
                return <CharacterView id={id} />;
            case 'location':
                return <LocationView id={id} />;
            case 'culture':
                return <div className="p-8 text-white">Culture View for ID: {id}</div>;
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
