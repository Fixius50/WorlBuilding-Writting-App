document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    // (Existing auth_guard runs first)

    // Load Universes for the current timeline view
    // For now, hardcode project ID or get from URL params if available.
    // If not, fetch for the first project of the user? 
    // Let's assume we are viewing a specific project: ?id=1
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id') || 1; // Default to Seeder Project

    await loadMultiverse(projectId);
});

async function loadEventsForTimeline(lineaId, lineaNombre) {
    const canvas = document.getElementById('canvas-content');
    const sidebar = document.getElementById('sidebar-events');

    canvas.innerHTML = '<div class="timeline-line"></div>';
    sidebar.innerHTML = '<div class="text-center text-slate-500 py-10 text-xs">Cargando...</div>';

    try {
        const events = await API.timeline.listarEventos(); // Asumimos cargar todos por ahora
        sidebar.innerHTML = '';

        let maxY = 0;

        events.forEach((evt, index) => {
            // Render on Canvas (Simplified Y-position based on index for now)
            const swimlaneOffset = (index % 2 === 0) ? 100 : 350;
            const yPos = 100 + (index * 120);

            // Track max height needed
            if (yPos > maxY) maxY = yPos;

            // Dot
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dot.style.top = `${yPos}px`;
            canvas.appendChild(dot);

            // Pill
            const pill = document.createElement('div');
            pill.className = 'event-pill animate-fade-in-up';
            pill.style.top = `${yPos - 15}px`;
            pill.style.left = '48%';
            pill.innerHTML = `
                <p class="text-[10px] text-indigo-400 font-bold mb-1">${evt.fechaInGame || 'Jan 01'}</p>
                <h4 class="text-xs font-bold text-white">${evt.titulo}</h4>
            `;
            canvas.appendChild(pill);

            // Render in Sidebar
            const card = document.createElement('div');
            card.className = `timeline-event-card ${index === 0 ? 'active' : ''}`;
            card.innerHTML = `
                <p class="text-[10px] text-slate-500 mb-1">${evt.fechaInGame || 'Jan 01, 452'}</p>
                <h4 class="text-sm font-bold text-white mb-2">${evt.titulo}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-2">${evt.descripcion || ''}</p>
            `;
            sidebar.appendChild(card);
        });

        // Dynamic Height Adjustment (Base height + buffer for last event)
        // Ensure at least min-h-full (handled by CSS), but expand if content is taller
        if (maxY > 0) {
            canvas.style.minHeight = `${maxY + 200}px`;
        }

    } catch (e) {
        console.error(e);
        sidebar.innerHTML = '<div class="text-red-400 text-xs p-4">Error cargando hilos del destino.</div>';
    }
}

// Scrubber Logic
function initScrubber() {
    const track = document.querySelector('.scrubber-track');
    const handle = document.querySelector('.scrubber-handle');
    if (!track || !handle) return;

    track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        handle.style.left = `${pct}%`;

        updateWorldState(pct);
    });
}

function updateWorldState(pct) {
    // Simulate year based on pct (0% = Year 0, 100% = Year 1000)
    const year = Math.floor(pct * 10);

    // Find or create widget
    let widget = document.getElementById('world-state-widget');
    if (!widget) {
        widget = document.createElement('div');
        widget.id = 'world-state-widget';
        widget.className = 'absolute top-24 right-8 w-64 glass-panel p-4 rounded-xl animate-fade-in-up';
        document.querySelector('main').appendChild(widget);
    }

    // Dynamic Content based on era
    let era = "Era del Amanecer";
    let ruler = "Consejo de Sabios";

    if (year > 300) { era = "Era de los Reinos"; ruler = "Rey Alric I"; }
    if (year > 600) { era = "Era Oscura"; ruler = "El Usurpador"; }
    if (year > 900) { era = "Renacimiento"; ruler = "Reina Elara"; }

    widget.innerHTML = `
        <h5 class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Estado del Mundo: Info</h5>
        <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-white font-bold">Año ${year}</span>
            <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">${era}</span>
        </div>
        <div class="text-xs text-slate-400">
            <p><strong class="text-slate-300">Gobernante:</strong> ${ruler}</p>
            <p><strong class="text-slate-300">Economía:</strong> ${year % 2 === 0 ? 'Estable' : 'En declive'}</p>
        </div>
    `;
}


document.addEventListener('DOMContentLoaded', () => {
    initScrubber();
    loadEventsForTimeline(); // For initial load
});
