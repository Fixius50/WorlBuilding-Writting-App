import React from 'react';

/**
 * Componente para mostrar un evento individual en la línea temporal.
 * Utiliza estética Dark Glassmorphism.
 */
const TimelineEventCard = ({ event, onClick }) => {
 const { title, date, description, type } = event;

 // Formatear la fecha para mostrarla de forma legible
 const formattedDate = date ? new Date(date).toLocaleDateString() : 'Sin fecha';

 return (
 <div className={`timeline-event-card ${type?.toLowerCase() || ''}`} onClick={() => onClick(event)}>
 <div className="event-date">{formattedDate}</div>
 <div className="event-content">
 <h4 className="event-title">{title}</h4>
 {description && <p className="event-description">{description}</p>}
 </div>
 <div className="event-dot"></div>
 </div>
 );
};

export default TimelineEventCard;
