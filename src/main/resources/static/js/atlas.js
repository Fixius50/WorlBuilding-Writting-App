/**
 * atlas.js - Tactical Map Implementation 3.0
 */

let map;
let markers = [];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    // Basic setup for a local coordinate system map
    // (In a real scenario, this would load a custom image tileset)
    map = L.map('map-container', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 4,
        zoomControl: false
    });

    const bounds = [[0, 0], [1000, 1000]];
    const image = L.imageOverlay('https://images.unsplash.com/photo-1548345680-f5475ee51c4c?q=80&w=2000', bounds).addTo(map);

    map.fitBounds(bounds);

    // Initial POIs (Mockup based on Image 4)
    addPOI([600, 400], "The Silver Spire", "Tower", "A legendary tower that pierces the clouds.");
    addPOI([450, 700], "Ancient Ruins", "Ruins", "Forgotten remnants of the First King.");
}

function addPOI(latlng, name, type, desc) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="size-6 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-white text-[14px]">location_on</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const marker = L.marker(latlng, { icon }).addTo(map);

    marker.on('click', () => {
        openPOI(name, type, desc);
    });

    markers.push(marker);
}

function openPOI(name, type, desc) {
    const sidebar = document.getElementById('poi-sidebar');
    const nameEl = document.getElementById('poi-name');
    const descEl = document.getElementById('poi-desc');

    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = desc;

    sidebar.classList.add('active');
}

function closePOI() {
    const sidebar = document.getElementById('poi-sidebar');
    sidebar.classList.remove('active');
}

// Global exposure
window.closePOI = closePOI;
